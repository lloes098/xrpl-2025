import { Client, Wallet } from "xrpl"
import { encodeForSigning, encode } from "ripple-binary-codec"
import { sign as kpSign, deriveKeypair } from "ripple-keypairs"
import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(process.cwd(), ".env") })

/**
 * TokenEscrow 핵심 기능 통합 클래스
 * XRPL의 기존 XRP 전용 Escrow 기능을 확장하여 IOU 토큰과 MPT도 에스크로 가능
 */
export class TokenEscrowManager {
  private client: Client
  private adminWallet: Wallet
  private userWallet: Wallet
  private user2Wallet: Wallet

  constructor(adminSeed: string, userSeed: string, user2Seed: string) {
    this.client = new Client("wss://s.devnet.rippletest.net:51233")
    this.adminWallet = Wallet.fromSeed(adminSeed)
    this.userWallet = Wallet.fromSeed(userSeed)
    this.user2Wallet = Wallet.fromSeed(user2Seed)
  }

  /**
   * XRPL 클라이언트 연결
   */
  async connect(): Promise<void> {
    await this.client.connect()
  }

  /**
   * XRPL 클라이언트 연결 해제
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect()
  }

  /**
   * 관리자 지갑 주소 반환
   */
  getAdminAddress(): string {
    return this.adminWallet.address
  }

  /**
   * 사용자 지갑 주소 반환
   */
  getUserAddress(): string {
    return this.userWallet.address
  }

  /**
   * 사용자2 지갑 주소 반환
   */
  getUser2Address(): string {
    return this.user2Wallet.address
  }

  /**
   * 현재 시간을 Ripple Epoch로 변환
   */
  private now(): number {
    return Math.floor(Date.now() / 1000) - 946_684_800
  }

  /**
   * Raw Signing을 위한 헬퍼 메서드
   */
  private async rawSign(tx: any, userSeed: string): Promise<string> {
    const prepared = await this.client.autofill(tx as any)
    
    // 1) 서명 대상 객체에 SigningPubKey를 "미리" 넣는다
    const toSign = {
      ...prepared,
      SigningPubKey: this.userWallet.publicKey
    }

    // 2) seed로 keypair 파생
    const { privateKey } = deriveKeypair(userSeed)

    // 3) 서명
    const signingData = encodeForSigning(toSign as any)
    const signature = kpSign(signingData, privateKey)

    // 4) 최종 인코딩
    const signedTx = { ...toSign, TxnSignature: signature }
    return encode(signedTx)
  }

  /**
   * IOU 토큰 에스크로 생성
   * @param currency IOU 통화 코드
   * @param issuer IOU 발행자 주소
   * @param value 에스크로할 수량
   * @param destination 목적지 주소
   * @param finishAfter 해제 가능 시간 (초)
   * @param cancelAfter 취소 가능 시간 (초)
   * @param condition 조건부 에스크로 (선택사항)
   * @returns 에스크로 생성 결과와 Sequence 번호
   */
  async createIOUEscrow(
    currency: string,
    issuer: string,
    value: string,
    destination: string,
    finishAfter: number,
    cancelAfter: number,
    condition?: string
  ): Promise<{ result: any; sequence: number }> {
    const tx: any = {
      TransactionType: "EscrowCreate",
      Account: this.userWallet.address, // IOU 토큰은 보유자가 에스크로 생성
      Destination: destination,
      Amount: {
        currency: currency,
        issuer: issuer,
        value: value
      } as any,
      FinishAfter: this.now() + finishAfter,
      CancelAfter: this.now() + cancelAfter,
      ...(condition && { Condition: condition })
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = this.adminWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("IOU 에스크로 생성 결과:", JSON.stringify(result, null, 2))
      console.log(`EscrowCreate(IOU) -> Owner=${this.adminWallet.address}, OfferSequence=${prepared.Sequence}`)

      return { result, sequence: prepared.Sequence! }
    } catch (error) {
      console.error("IOU 에스크로 생성 실패:", error)
      throw error
    }
  }

  /**
   * MPT 토큰 에스크로 생성
   * @param issuanceId MPT 발행 ID
   * @param value 에스크로할 수량
   * @param destination 목적지 주소
   * @param finishAfter 해제 가능 시간 (초)
   * @param cancelAfter 취소 가능 시간 (초)
   * @param condition 조건부 에스크로 (선택사항)
   * @returns 에스크로 생성 결과와 Sequence 번호
   */
  async createMPTEscrow(
    issuanceId: string,
    value: string,
    destination: string,
    finishAfter: number,
    cancelAfter: number,
    condition?: string
  ): Promise<{ result: any; sequence: number }> {
    const tx: any = {
      TransactionType: "EscrowCreate",
      Account: this.userWallet.address,
      Destination: destination,
      Amount: {
        mpt_issuance_id: issuanceId,
        value: value
      } as any,
      FinishAfter: this.now() + finishAfter,
      CancelAfter: this.now() + cancelAfter,
      ...(condition && { Condition: condition })
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = this.userWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("MPT 에스크로 생성 결과:", JSON.stringify(result, null, 2))
      console.log(`EscrowCreate(MPT) -> Owner=${this.userWallet.address}, OfferSequence=${prepared.Sequence}`)

      return { result, sequence: prepared.Sequence! }
    } catch (error) {
      console.error("MPT 에스크로 생성 실패:", error)
      throw error
    }
  }

  /**
   * 에스크로 해제 (FinishAfter 시간 경과 후)
   * @param ownerAddress 에스크로 소스 주소
   * @param offerSequence 에스크로 생성 시 Sequence 번호
   * @param finisherSeed Finish 실행자 시드 (기본값: user2Seed)
   * @param fulfillment 조건부 에스크로의 경우 Fulfillment (선택사항)
   */
  async finishEscrow(
    ownerAddress: string,
    offerSequence: number,
    finisherSeed?: string,
    fulfillment?: string
  ): Promise<any> {
    const finisher = finisherSeed ? Wallet.fromSeed(finisherSeed) : this.user2Wallet

    const tx: any = {
      TransactionType: "EscrowFinish",
      Account: finisher.address,
      Owner: ownerAddress,
      OfferSequence: offerSequence,
      ...(fulfillment && { Fulfillment: fulfillment })
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = finisher.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("에스크로 해제 결과:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("에스크로 해제 실패:", error)
      throw error
    }
  }

  /**
   * 에스크로 취소 (CancelAfter 시간 경과 후)
   * @param ownerAddress 에스크로 소스 주소
   * @param offerSequence 에스크로 생성 시 Sequence 번호
   * @param cancelerSeed Cancel 실행자 시드 (기본값: userSeed)
   */
  async cancelEscrow(
    ownerAddress: string,
    offerSequence: number,
    cancelerSeed?: string
  ): Promise<any> {
    const canceler = cancelerSeed ? Wallet.fromSeed(cancelerSeed) : this.userWallet

    const tx: any = {
      TransactionType: "EscrowCancel",
      Account: canceler.address,
      Owner: ownerAddress,
      OfferSequence: offerSequence
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = canceler.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("에스크로 취소 결과:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("에스크로 취소 실패:", error)
      throw error
    }
  }

  /**
   * IOU 에스크로 완전한 생명주기 실행
   * @param currency IOU 통화 코드
   * @param issuer IOU 발행자 주소
   * @param value 에스크로할 수량
   * @param finishAfter 해제 가능 시간 (초)
   * @param cancelAfter 취소 가능 시간 (초)
   * @param autoFinish 자동으로 Finish 실행할지 여부 (기본값: true)
   */
  async runIOUEscrowLifecycle(
    currency: string,
    issuer: string,
    value: string,
    finishAfter: number,
    cancelAfter: number,
    autoFinish: boolean = true
  ): Promise<void> {
    try {
      console.log("=== IOU 에스크로 생명주기 시작 ===")
      
      // 1. IOU 에스크로 생성
      console.log("1. IOU 에스크로 생성 중...")
      const { sequence } = await this.createIOUEscrow(
        currency,
        issuer,
        value,
        this.user2Wallet.address,
        finishAfter,
        cancelAfter
      )
      
      if (autoFinish) {
        // 2. FinishAfter 시간 대기
        console.log(`2. ${finishAfter}초 대기 중...`)
        await new Promise(resolve => setTimeout(resolve, finishAfter * 1000))
        
        // 3. 에스크로 해제
        console.log("3. 에스크로 해제 중...")
        await this.finishEscrow(this.userWallet.address, sequence)
      }
      
      console.log("=== IOU 에스크로 생명주기 완료 ===")
    } catch (error) {
      console.error("IOU 에스크로 생명주기 실행 실패:", error)
      throw error
    }
  }

  /**
   * MPT 에스크로 완전한 생명주기 실행
   * @param issuanceId MPT 발행 ID
   * @param value 에스크로할 수량
   * @param finishAfter 해제 가능 시간 (초)
   * @param cancelAfter 취소 가능 시간 (초)
   * @param autoFinish 자동으로 Finish 실행할지 여부 (기본값: true)
   */
  async runMPTEscrowLifecycle(
    issuanceId: string,
    value: string,
    finishAfter: number,
    cancelAfter: number,
    autoFinish: boolean = true
  ): Promise<void> {
    try {
      console.log("=== MPT 에스크로 생명주기 시작 ===")
      
      // 1. MPT 에스크로 생성
      console.log("1. MPT 에스크로 생성 중...")
      const { sequence } = await this.createMPTEscrow(
        issuanceId,
        value,
        this.user2Wallet.address,
        finishAfter,
        cancelAfter
      )
      
      if (autoFinish) {
        // 2. FinishAfter 시간 대기
        console.log(`2. ${finishAfter}초 대기 중...`)
        await new Promise(resolve => setTimeout(resolve, finishAfter * 1000))
        
        // 3. 에스크로 해제
        console.log("3. 에스크로 해제 중...")
        await this.finishEscrow(this.userWallet.address, sequence)
      }
      
      console.log("=== MPT 에스크로 생명주기 완료 ===")
    } catch (error) {
      console.error("MPT 에스크로 생명주기 실행 실패:", error)
      throw error
    }
  }

  /**
   * 에스크로 정보 조회
   * @param ownerAddress 에스크로 소스 주소
   * @param offerSequence 에스크로 Sequence 번호
   */
  async getEscrowInfo(ownerAddress: string, offerSequence: number): Promise<any> {
    try {
      const response = await this.client.request({
        command: "account_objects",
        account: ownerAddress,
        type: "escrow",
        ledger_index: "validated"
      })

      const escrow = response.result.account_objects.find(
        (obj: any) => obj.PreviousTxnID && obj.Sequence === offerSequence
      )

      if (escrow) {
        console.log("에스크로 정보:", JSON.stringify(escrow, null, 2))
        return escrow
      } else {
        console.log("에스크로를 찾을 수 없습니다.")
        return null
      }
    } catch (error) {
      console.error("에스크로 정보 조회 실패:", error)
      throw error
    }
  }
}

// 개별 기능들을 위한 헬퍼 함수들
export async function createIOUEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  currency: string,
  issuer: string,
  value: string,
  destination: string,
  finishAfter: number,
  cancelAfter: number
): Promise<any> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.createIOUEscrow(currency, issuer, value, destination, finishAfter, cancelAfter);
  } finally {
    await escrowManager.disconnect();
  }
}

export async function createMPTEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  issuanceId: string,
  value: string,
  destination: string,
  finishAfter: number,
  cancelAfter: number
): Promise<any> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.createMPTEscrow(issuanceId, value, destination, finishAfter, cancelAfter);
  } finally {
    await escrowManager.disconnect();
  }
}

export async function finishEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  owner: string,
  offerSequence: number
): Promise<any> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.finishEscrow(owner, offerSequence);
  } finally {
    await escrowManager.disconnect();
  }
}

export async function cancelEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  owner: string,
  offerSequence: number
): Promise<any> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.cancelEscrow(owner, offerSequence);
  } finally {
    await escrowManager.disconnect();
  }
}

export async function getEscrowInfo(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  owner: string,
  offerSequence: number
): Promise<any> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.getEscrowInfo(owner, offerSequence);
  } finally {
    await escrowManager.disconnect();
  }
}

export async function runIOUEscrowLifecycle(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  currency: string,
  issuer: string,
  value: string,
  finishAfter: number,
  cancelAfter: number,
  autoFinish: boolean = true
): Promise<void> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.runIOUEscrowLifecycle(currency, issuer, value, finishAfter, cancelAfter, autoFinish);
  } finally {
    await escrowManager.disconnect();
  }
}

export async function runMPTEscrowLifecycle(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  issuanceId: string,
  value: string,
  finishAfter: number,
  cancelAfter: number,
  autoFinish: boolean = true
): Promise<void> {
  const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed);
  
  try {
    await escrowManager.connect();
    return await escrowManager.runMPTEscrowLifecycle(issuanceId, value, finishAfter, cancelAfter, autoFinish);
  } finally {
    await escrowManager.disconnect();
  }
}
