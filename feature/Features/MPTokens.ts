import { Client, Wallet } from "xrpl"
import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(process.cwd(), ".env") })

/**
 * MPTokens (Multi-Purpose Token) 핵심 기능 통합 클래스
 * XRPL의 새로운 펀저블 토큰 타입으로, 기존 IOU보다 단순한 발행·보유 모델 제공
 */
export class MPTokenManager {
  private client: Client
  private adminWallet: Wallet
  private userWallet?: Wallet

  constructor(adminSeed: string, userSeed?: string) {
    this.client = new Client("wss://s.devnet.rippletest.net:51233")
    this.adminWallet = Wallet.fromSeed(adminSeed)
    if (userSeed) {
      this.userWallet = Wallet.fromSeed(userSeed)
    }
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
   * 사용자 지갑 주소 반환
   */
  getUserAddress(): string | undefined {
    return this.userWallet?.address
  }

  /**
   * MPT 발행 정의 생성
   * @param assetScale 소수점 자릿수 (기본값: 0)
   * @param maximumAmount 최대 발행량 (기본값: "1000000000")
   * @param flags 발행 정책 플래그
   * @param metadata 메타데이터 (hex 문자열, 선택사항)
   * @returns 발행 결과와 IssuanceID
   */
  async createIssuance(
    assetScale: number = 0,
    maximumAmount: string = "1000000000",
    flags: {
      tfMPTCanTransfer?: boolean
      tfMPTCanEscrow?: boolean
      tfMPTRequireAuth?: boolean
    } = {
      tfMPTCanTransfer: true,
      tfMPTCanEscrow: true,
      tfMPTRequireAuth: false
    },
    metadata?: string
  ): Promise<{ result: any; issuanceId: string }> {
    const tx: any = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: this.adminWallet.address,
      AssetScale: assetScale,
      MaximumAmount: maximumAmount,
      Flags: flags,
      ...(metadata && { MPTokenMetadata: metadata })
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = this.adminWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("발행 생성 결과:", JSON.stringify(result, null, 2))

      // IssuanceID 추출
      const issuanceId = (result.result.meta as any)?.mpt_issuance_id
      if (issuanceId) {
        console.log(`IssuanceID(created): ${issuanceId}`)
        return { result, issuanceId }
      } else {
        throw new Error("IssuanceID를 찾을 수 없습니다.")
      }
    } catch (error) {
      console.error("발행 생성 실패:", error)
      throw error
    }
  }

  /**
   * 홀더 권한 부여 (RequireAuth 모드일 때 필요)
   * @param issuanceId 발행 ID
   * @param holderAddress 홀더 주소 (기본값: userWallet 주소)
   * @param isUnauthorize 권한 해제 여부 (기본값: false)
   */
  async authorizeHolder(
    issuanceId: string,
    holderAddress?: string,
    isUnauthorize: boolean = false
  ): Promise<any> {
    if (!this.userWallet && !holderAddress) {
      throw new Error("홀더 주소가 필요합니다.")
    }

    const tx: any = {
      TransactionType: "MPTokenAuthorize",
      Account: this.adminWallet.address,
      MPTokenIssuanceID: issuanceId,
      Holder: holderAddress || this.userWallet!.address,
      ...(isUnauthorize && { Flags: { tfMPTUnauthorize: true } })
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = this.adminWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("권한 부여 결과:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("권한 부여 실패:", error)
      throw error
    }
  }

  /**
   * 사용자가 직접 Opt-in (권한 요청)
   * @param issuanceId 발행 ID
   */
  async optIn(issuanceId: string): Promise<any> {
    if (!this.userWallet) {
      throw new Error("사용자 지갑이 필요합니다.")
    }

    const tx: any = {
      TransactionType: "MPTokenAuthorize",
      Account: this.userWallet.address,
      MPTokenIssuanceID: issuanceId
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = this.userWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("Opt-in 결과:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("Opt-in 실패:", error)
      throw error
    }
  }

  /**
   * MPT 전송
   * @param issuanceId 발행 ID
   * @param destinationAddress 수신자 주소
   * @param amount 전송할 수량
   * @param fromAdmin 관리자가 전송하는지 여부 (기본값: true)
   */
  async sendMPT(
    issuanceId: string,
    destinationAddress: string,
    amount: string,
    fromAdmin: boolean = true
  ): Promise<any> {
    const senderWallet = fromAdmin ? this.adminWallet : this.userWallet
    if (!senderWallet) {
      throw new Error("전송자 지갑이 필요합니다.")
    }

    const tx: any = {
      TransactionType: "Payment",
      Account: senderWallet.address,
      Destination: destinationAddress,
      Amount: {
        mpt_issuance_id: issuanceId,
        value: amount
      }
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = senderWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("MPT 전송 결과:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("MPT 전송 실패:", error)
      throw error
    }
  }

  /**
   * 발행 정의 삭제 (모든 홀더 잔액이 0일 때만 가능)
   * @param issuanceId 발행 ID
   */
  async destroyIssuance(issuanceId: string): Promise<any> {
    const tx: any = {
      TransactionType: "MPTokenIssuanceDestroy",
      Account: this.adminWallet.address,
      MPTokenIssuanceID: issuanceId
    }

    try {
      const prepared = await this.client.autofill(tx)
      const signed = this.adminWallet.sign(prepared)
      const result = await this.client.submitAndWait(signed.tx_blob)

      console.log("발행 삭제 결과:", JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error("발행 삭제 실패:", error)
      throw error
    }
  }

  /**
   * 완전한 MPT 생명주기 실행 (생성 → 권한부여 → 전송 → 삭제)
   * @param amount 전송할 수량
   * @param userAddress 사용자 주소 (선택사항)
   */
  async runFullLifecycle(amount: string = "1000", userAddress?: string): Promise<void> {
    try {
      console.log("=== MPT 생명주기 시작 ===")
      
      // 1. 발행 생성
      console.log("1. 발행 생성 중...")
      const { issuanceId } = await this.createIssuance()
      
      // 2. 권한 부여 (RequireAuth가 true인 경우)
      console.log("2. 권한 부여 중...")
      await this.authorizeHolder(issuanceId, userAddress)
      
      // 3. MPT 전송
      console.log("3. MPT 전송 중...")
      const destination = userAddress || this.userWallet?.address
      if (!destination) {
        throw new Error("전송 대상 주소가 필요합니다.")
      }
      await this.sendMPT(issuanceId, destination, amount)
      
      // 4. 발행 삭제 (선택사항)
      console.log("4. 발행 삭제 중...")
      await this.destroyIssuance(issuanceId)
      
      console.log("=== MPT 생명주기 완료 ===")
    } catch (error) {
      console.error("MPT 생명주기 실행 실패:", error)
      throw error
    }
  }
}

// 개별 기능들을 위한 헬퍼 함수들
export async function createMPToken(
  adminSeed: string,
  userSeed: string,
  assetScale: number = 0,
  maximumAmount: string = "1000000000",
  metadata?: string
): Promise<{ result: any; issuanceId: string }> {
  const mptManager = new MPTokenManager(adminSeed, userSeed)
  
  try {
    await mptManager.connect()
    
    const flags = {
      tfMPTCanTransfer: true,
      tfMPTCanEscrow: true,
      tfMPTRequireAuth: false
    }
    
    return await mptManager.createIssuance(assetScale, maximumAmount, flags, metadata)
  } finally {
    await mptManager.disconnect()
  }
}

export async function optInMPToken(
  userSeed: string,
  issuanceId: string
): Promise<any> {
  const mptManager = new MPTokenManager("sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", userSeed)
  
  try {
    await mptManager.connect()
    return await mptManager.optIn(issuanceId)
  } finally {
    await mptManager.disconnect()
  }
}

export async function sendMPToken(
  adminSeed: string,
  userSeed: string,
  issuanceId: string,
  destinationAddress: string,
  amount: string,
  fromAdmin: boolean = true
): Promise<any> {
  const mptManager = new MPTokenManager(adminSeed, userSeed)
  
  try {
    await mptManager.connect()
    return await mptManager.sendMPT(issuanceId, destinationAddress, amount, fromAdmin)
  } finally {
    await mptManager.disconnect()
  }
}

export async function authorizeMPToken(
  adminSeed: string,
  issuanceId: string,
  holderAddress: string,
  isUnauthorize: boolean = false
): Promise<any> {
  const mptManager = new MPTokenManager(adminSeed)
  
  try {
    await mptManager.connect()
    return await mptManager.authorizeHolder(issuanceId, holderAddress, isUnauthorize)
  } finally {
    await mptManager.disconnect()
  }
}

export async function destroyMPToken(
  adminSeed: string,
  issuanceId: string
): Promise<any> {
  const mptManager = new MPTokenManager(adminSeed)
  
  try {
    await mptManager.connect()
    return await mptManager.destroyIssuance(issuanceId)
  } finally {
    await mptManager.disconnect()
  }
}
