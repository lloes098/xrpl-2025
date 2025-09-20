import { TokenEscrowManager } from "./TokenEscrow"
import { MPTokenManager } from "./MPTokens"

/**
 * 에스크로 핵심 기능 클래스
 * 에스크로 생성, 완료, 취소 기능만 제공
 */
export class EscrowCore {
  private escrowManager: TokenEscrowManager
  private mptManager: MPTokenManager

  constructor(adminSeed: string, userSeed: string, user2Seed: string) {
    this.escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed)
    this.mptManager = new MPTokenManager(adminSeed, userSeed)
  }

  /**
   * XRPL 클라이언트 연결
   */
  async connect(): Promise<void> {
    await this.escrowManager.connect()
    await this.mptManager.connect()
  }

  /**
   * XRPL 클라이언트 연결 해제
   */
  async disconnect(): Promise<void> {
    await this.escrowManager.disconnect()
    await this.mptManager.disconnect()
  }

  /**
   * MPT 토큰 발행
   */
  async createMPToken(maxAmount: string, flags: any = { tfMPTCanTransfer: true, tfMPTCanEscrow: true, tfMPTRequireAuth: false }): Promise<{ issuanceId: string }> {
    const { issuanceId } = await this.mptManager.createIssuance(0, maxAmount, flags)
    return { issuanceId }
  }

  /**
   * 사용자 Opt-in
   */
  async optIn(issuanceId: string): Promise<void> {
    await this.mptManager.optIn(issuanceId)
  }

  /**
   * MPT 토큰 전송
   */
  async sendMPT(issuanceId: string, destination: string, amount: string): Promise<void> {
    await this.mptManager.sendMPT(issuanceId, destination, amount, true)
  }

  /**
   * 에스크로 생성 (시간 설정 가능)
   * @param issuanceId MPT 발행 ID
   * @param value 에스크로할 수량
   * @param destination 목적지 주소
   * @param finishAfter 해제 가능 시간 (초) - 0이면 즉시 해제 가능
   * @param cancelAfter 취소 가능 시간 (초) - finishAfter보다 나중이어야 함
   */
  async createEscrow(
    issuanceId: string,
    value: string,
    destination: string,
    finishAfter: number = 0,
    cancelAfter: number = 0
  ): Promise<{ sequence: number }> {
    const { sequence } = await this.escrowManager.createMPTEscrow(
      issuanceId,
      value,
      destination,
      finishAfter,
      cancelAfter
    )
    return { sequence }
  }

  /**
   * 에스크로 완료 (해제)
   * @param ownerAddress 에스크로 소유자 주소
   * @param sequence 에스크로 시퀀스 번호
   */
  async finishEscrow(ownerAddress: string, sequence: number): Promise<void> {
    await this.escrowManager.finishEscrow(ownerAddress, sequence)
  }

  /**
   * 에스크로 취소
   * @param ownerAddress 에스크로 소유자 주소
   * @param sequence 에스크로 시퀀스 번호
   */
  async cancelEscrow(ownerAddress: string, sequence: number): Promise<void> {
    await this.escrowManager.cancelEscrow(ownerAddress, sequence)
  }

  /**
   * 에스크로 정보 조회
   * @param ownerAddress 에스크로 소유자 주소
   * @param sequence 에스크로 시퀀스 번호
   */
  async getEscrowInfo(ownerAddress: string, sequence: number): Promise<any> {
    return await this.escrowManager.getEscrowInfo(ownerAddress, sequence)
  }

  /**
   * 주소 정보 반환
   */
  getAddresses() {
    return {
      admin: this.escrowManager.getAdminAddress(),
      user: this.escrowManager.getUserAddress(),
      user2: this.escrowManager.getUser2Address()
    }
  }
}

// 편의 함수들
export async function createEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  issuanceId: string,
  value: string,
  destination: string,
  finishAfter: number = 0,
  cancelAfter: number = 0
): Promise<{ sequence: number }> {
  const escrowCore = new EscrowCore(adminSeed, userSeed, user2Seed)
  
  try {
    await escrowCore.connect()
    return await escrowCore.createEscrow(issuanceId, value, destination, finishAfter, cancelAfter)
  } finally {
    await escrowCore.disconnect()
  }
}

export async function finishEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  ownerAddress: string,
  sequence: number
): Promise<void> {
  const escrowCore = new EscrowCore(adminSeed, userSeed, user2Seed)
  
  try {
    await escrowCore.connect()
    await escrowCore.finishEscrow(ownerAddress, sequence)
  } finally {
    await escrowCore.disconnect()
  }
}

export async function cancelEscrow(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  ownerAddress: string,
  sequence: number
): Promise<void> {
  const escrowCore = new EscrowCore(adminSeed, userSeed, user2Seed)
  
  try {
    await escrowCore.connect()
    await escrowCore.cancelEscrow(ownerAddress, sequence)
  } finally {
    await escrowCore.disconnect()
  }
}

export async function getEscrowInfo(
  adminSeed: string,
  userSeed: string,
  user2Seed: string,
  ownerAddress: string,
  sequence: number
): Promise<any> {
  const escrowCore = new EscrowCore(adminSeed, userSeed, user2Seed)
  
  try {
    await escrowCore.connect()
    return await escrowCore.getEscrowInfo(ownerAddress, sequence)
  } finally {
    await escrowCore.disconnect()
  }
}
