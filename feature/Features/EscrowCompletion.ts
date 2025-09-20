import { TokenEscrowManager } from "./TokenEscrow.ts"
import { MPTokenManager } from "./MPTokens.ts"

/**
 * 에스크로 체결(해제) 예제 클래스
 * 생성된 에스크로를 다양한 방법으로 체결하는 방법을 보여줍니다
 */
export class EscrowCompletionExample {
  private escrowManager: TokenEscrowManager
  private mptManager: MPTokenManager

  constructor() {
    // DevNet 테스트용 시드들
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc"
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW"
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V"

    this.escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED)
    this.mptManager = new MPTokenManager(ADMIN_SEED, USER_SEED)
  }

  /**
   * 테스트 환경 초기화
   */
  async initialize(): Promise<void> {
    console.log("🔧 에스크로 체결 예제 환경 초기화 중...")
    await this.escrowManager.connect()
    await this.mptManager.connect()
    console.log("✅ 환경 초기화 완료")
  }

  /**
   * 테스트 환경 정리
   */
  async cleanup(): Promise<void> {
    console.log("🧹 환경 정리 중...")
    await this.escrowManager.disconnect()
    await this.mptManager.disconnect()
    console.log("✅ 환경 정리 완료")
  }

  /**
   * 1. 자동 해제 시나리오 (FinishAfter 시간 경과 후)
   */
  async demonstrateAutoFinish(): Promise<void> {
    console.log("\n🕐 === 자동 해제 시나리오 ===")
    console.log("FinishAfter 시간이 지나면 자동으로 에스크로가 해제됩니다.")

    try {
      // 1. MPT 토큰 발행
      const { issuanceId } = await this.mptManager.createIssuance(
        0, "1000000", 
        { tfMPTCanTransfer: true, tfMPTCanEscrow: true, tfMPTRequireAuth: false }
      )

      // 2. 사용자 Opt-in
      await this.mptManager.optIn(issuanceId)

      // 3. 토큰 전송
      await this.mptManager.sendMPT(issuanceId, this.escrowManager.getUserAddress(), "1000", true)

      // 4. 에스크로 생성 (5초 후 자동 해제)
      console.log("📝 에스크로 생성 중... (5초 후 자동 해제)")
      const { sequence } = await this.escrowManager.createMPTEscrow(
        issuanceId,
        "500",
        this.escrowManager.getUser2Address(),
        5, // 5초 후 해제 가능
        30 // 30초 후 취소 가능
      )

      console.log(`✅ 에스크로 생성 완료 - Sequence: ${sequence}`)
      console.log("⏳ 5초 대기 중... (자동 해제를 위해)")

      // 5. 자동 해제 실행
      await this.escrowManager.finishEscrow(
        this.escrowManager.getUserAddress(), 
        sequence
      )

      console.log("🎉 자동 해제 완료! 에스크로된 토큰이 목적지로 전송되었습니다.")

    } catch (error) {
      console.error("❌ 자동 해제 시나리오 실패:", error)
      throw error
    }
  }

  /**
   * 2. 수동 해제 시나리오 (즉시 해제)
   */
  async demonstrateManualFinish(): Promise<void> {
    console.log("\n👤 === 수동 해제 시나리오 ===")
    console.log("FinishAfter 시간이 지난 후 수동으로 에스크로를 해제합니다.")

    try {
      // 1. MPT 토큰 발행
      const { issuanceId } = await this.mptManager.createIssuance(
        0, "1000000", 
        { tfMPTCanTransfer: true, tfMPTCanEscrow: true, tfMPTRequireAuth: false }
      )

      // 2. 사용자 Opt-in
      await this.mptManager.optIn(issuanceId)

      // 3. 토큰 전송
      await this.mptManager.sendMPT(issuanceId, this.escrowManager.getUserAddress(), "1000", true)

      // 4. 에스크로 생성 (즉시 해제 가능)
      console.log("📝 에스크로 생성 중... (즉시 해제 가능)")
      const { sequence } = await this.escrowManager.createMPTEscrow(
        issuanceId,
        "300",
        this.escrowManager.getUser2Address(),
        0, // 즉시 해제 가능
        60 // 60초 후 취소 가능
      )

      console.log(`✅ 에스크로 생성 완료 - Sequence: ${sequence}`)

      // 5. 수동 해제 실행
      console.log("🔓 수동으로 에스크로 해제 중...")
      await this.escrowManager.finishEscrow(
        this.escrowManager.getUserAddress(), 
        sequence
      )

      console.log("🎉 수동 해제 완료! 에스크로된 토큰이 목적지로 전송되었습니다.")

    } catch (error) {
      console.error("❌ 수동 해제 시나리오 실패:", error)
      throw error
    }
  }

  /**
   * 3. 에스크로 취소 시나리오
   */
  async demonstrateEscrowCancel(): Promise<void> {
    console.log("\n❌ === 에스크로 취소 시나리오 ===")
    console.log("CancelAfter 시간이 지난 후 에스크로를 취소합니다.")

    try {
      // 1. MPT 토큰 발행
      const { issuanceId } = await this.mptManager.createIssuance(
        0, "1000000", 
        { tfMPTCanTransfer: true, tfMPTCanEscrow: true, tfMPTRequireAuth: false }
      )

      // 2. 사용자 Opt-in
      await this.mptManager.optIn(issuanceId)

      // 3. 토큰 전송
      await this.mptManager.sendMPT(issuanceId, this.escrowManager.getUserAddress(), "1000", true)

      // 4. 에스크로 생성 (취소 전용)
      console.log("📝 에스크로 생성 중... (취소 테스트용)")
      const { sequence } = await this.escrowManager.createMPTEscrow(
        issuanceId,
        "200",
        this.escrowManager.getUser2Address(),
        30, // 30초 후 해제 가능
        5   // 5초 후 취소 가능
      )

      console.log(`✅ 에스크로 생성 완료 - Sequence: ${sequence}`)
      console.log("⏳ 5초 대기 중... (취소 가능 시간까지)")

      // 5. 취소 실행
      await new Promise(resolve => setTimeout(resolve, 5000))
      console.log("🚫 에스크로 취소 중...")
      await this.escrowManager.cancelEscrow(
        this.escrowManager.getUserAddress(), 
        sequence
      )

      console.log("🎉 에스크로 취소 완료! 토큰이 원래 소유자에게 반환되었습니다.")

    } catch (error) {
      console.error("❌ 에스크로 취소 시나리오 실패:", error)
      throw error
    }
  }

  /**
   * 4. 에스크로 상태 확인
   */
  async demonstrateEscrowStatusCheck(): Promise<void> {
    console.log("\n🔍 === 에스크로 상태 확인 ===")
    console.log("생성된 에스크로의 상태를 확인하는 방법을 보여줍니다.")

    try {
      // 1. MPT 토큰 발행
      const { issuanceId } = await this.mptManager.createIssuance(
        0, "1000000", 
        { tfMPTCanTransfer: true, tfMPTCanEscrow: true, tfMPTRequireAuth: false }
      )

      // 2. 사용자 Opt-in
      await this.mptManager.optIn(issuanceId)

      // 3. 토큰 전송
      await this.mptManager.sendMPT(issuanceId, this.escrowManager.getUserAddress(), "1000", true)

      // 4. 에스크로 생성
      console.log("📝 에스크로 생성 중...")
      const { sequence } = await this.escrowManager.createMPTEscrow(
        issuanceId,
        "400",
        this.escrowManager.getUser2Address(),
        10, // 10초 후 해제 가능
        30  // 30초 후 취소 가능
      )

      console.log(`✅ 에스크로 생성 완료 - Sequence: ${sequence}`)

      // 5. 에스크로 상태 확인
      console.log("🔍 에스크로 상태 확인 중...")
      const escrowInfo = await this.escrowManager.getEscrowInfo(
        this.escrowManager.getUserAddress(), 
        sequence
      )

      if (escrowInfo) {
        console.log("📊 에스크로 정보:")
        console.log(`   - 소유자: ${escrowInfo.Account}`)
        console.log(`   - 목적지: ${escrowInfo.Destination}`)
        console.log(`   - 금액: ${JSON.stringify(escrowInfo.Amount)}`)
        console.log(`   - 해제 가능 시간: ${new Date((escrowInfo.FinishAfter + 946684800) * 1000).toLocaleString()}`)
        console.log(`   - 취소 가능 시간: ${new Date((escrowInfo.CancelAfter + 946684800) * 1000).toLocaleString()}`)
        console.log(`   - 현재 상태: ${escrowInfo.Flags === 0 ? '활성' : '비활성'}`)
      } else {
        console.log("⚠️ 에스크로 정보를 찾을 수 없습니다.")
      }

    } catch (error) {
      console.error("❌ 에스크로 상태 확인 실패:", error)
      throw error
    }
  }

  /**
   * 모든 에스크로 체결 시나리오 실행
   */
  async runAllScenarios(): Promise<void> {
    console.log("🚀 === 에스크로 체결 방법 완전 가이드 ===")
    console.log("=".repeat(60))

    try {
      await this.initialize()

      // 1. 자동 해제 시나리오
      await this.demonstrateAutoFinish()

      // 잠시 대기
      console.log("\n⏳ 다음 시나리오를 위해 3초 대기...")
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 2. 수동 해제 시나리오
      await this.demonstrateManualFinish()

      // 잠시 대기
      console.log("\n⏳ 다음 시나리오를 위해 3초 대기...")
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 3. 에스크로 취소 시나리오
      await this.demonstrateEscrowCancel()

      // 잠시 대기
      console.log("\n⏳ 다음 시나리오를 위해 3초 대기...")
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 4. 에스크로 상태 확인
      await this.demonstrateEscrowStatusCheck()

      console.log("\n" + "=".repeat(60))
      console.log("🎉 모든 에스크로 체결 시나리오 완료!")

    } catch (error) {
      console.error("💥 에스크로 체결 예제 실행 실패:", error)
      throw error
    } finally {
      await this.cleanup()
    }
  }
}

/**
 * 에스크로 체결 예제 실행 함수
 */
export async function runEscrowCompletionExample(): Promise<void> {
  const example = new EscrowCompletionExample()
  await example.runAllScenarios()
}

// 직접 실행 시
runEscrowCompletionExample().catch(e => {
  console.error("에스크로 체결 예제 실행 실패:", e)
  process.exit(1)
})
