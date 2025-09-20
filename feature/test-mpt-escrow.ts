import { TokenEscrowManager } from "./Features/TokenEscrow";
import { createMPToken, optInMPToken } from "./Features/MPTokens";

// 테스트용 시드들
const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";

/**
 * MPT 에스크로 테스트
 */
async function testMPTEscrow() {
  console.log("=== MPT 에스크로 테스트 ===");
  
  try {
    // 1. MPT 발행
    console.log("1. MPT 발행 중...");
    const { issuanceId } = await createMPToken(ADMIN_SEED, USER_SEED);
    console.log("✅ MPT 발행 성공! IssuanceID:", issuanceId);
    
    // 2. Opt-in
    console.log("\n2. Opt-in 중...");
    await optInMPToken(USER_SEED, issuanceId);
    console.log("✅ Opt-in 성공!");
    
    // 3. MPT 전송 (사용자가 MPT를 보유하도록)
    console.log("\n3. MPT 전송 중...");
    const userWallet = require("xrpl").Wallet.fromSeed(USER_SEED);
    const { sendMPToken } = await import("./Features/MPTokens");
    await sendMPToken(ADMIN_SEED, USER_SEED, issuanceId, userWallet.address, "100");
    console.log("✅ MPT 전송 성공!");
    
    // 4. 잠시 대기
    console.log("\n4. 3초 대기 중...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. MPT 에스크로 생성
    console.log("\n5. MPT 에스크로 생성 중...");
    const escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED);
    
    try {
      await escrowManager.connect();
      
      const mptResult = await escrowManager.createMPTEscrow(
        issuanceId,
        "10", // 10 MPT
        escrowManager.getUser2Address(), // destination
        5,  // finishAfter
        30  // cancelAfter
      );
      
      console.log("✅ MPT 에스크로 생성 성공!");
      console.log("Sequence:", mptResult.sequence);
      
      // 6. 잠시 대기
      console.log("\n6. 3초 대기 중...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 7. 에스크로 완료
      console.log("\n7. 에스크로 완료 중...");
      const finishResult = await escrowManager.finishEscrow(
        escrowManager.getUserAddress(), // owner (에스크로를 생성한 주소)
        mptResult.sequence
      );
      console.log("✅ 에스크로 완료 성공!");
      
    } finally {
      await escrowManager.disconnect();
    }
    
    console.log("\n🎉 MPT 에스크로 테스트 완료!");
    
  } catch (error) {
    console.error("❌ MPT 에스크로 테스트 실패:", error);
  }
}

// 메인 실행 함수
async function main() {
  console.log("🚀 MPT 에스크로 테스트 시작\n");
  
  try {
    await testMPTEscrow();
  } catch (error) {
    console.error("❌ 전체 테스트 실패:", error);
  }
  
  console.log("\n🏁 모든 테스트 완료!");
}

// 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}
