import { TokenEscrowManager } from "./Features/TokenEscrow";

// 테스트용 시드들
const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";

/**
 * 간단한 TokenEscrow 테스트
 */
async function testSimpleEscrow() {
  console.log("=== 간단한 TokenEscrow 테스트 ===");
  
  const escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED);
  
  try {
    await escrowManager.connect();
    
    console.log("1. 연결 성공!");
    console.log("Admin Address:", escrowManager.getAdminAddress());
    console.log("User Address:", escrowManager.getUserAddress());
    console.log("User2 Address:", escrowManager.getUser2Address());
    
    // 2. IOU 에스크로 생성 시도 (작은 금액으로)
    console.log("\n2. IOU 에스크로 생성 시도...");
    try {
      const iouResult = await escrowManager.createIOUEscrow(
        "ETF",
        escrowManager.getAdminAddress(), // issuer
        "1", // 작은 금액
        escrowManager.getUser2Address(), // destination
        5,  // finishAfter
        30  // cancelAfter
      );
      console.log("✅ IOU 에스크로 생성 성공!");
      console.log("Sequence:", iouResult.sequence);
      
      // 3. 잠시 대기
      console.log("\n3. 3초 대기 중...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 4. 에스크로 완료
      console.log("\n4. 에스크로 완료 중...");
      const finishResult = await escrowManager.finishEscrow(
        escrowManager.getAdminAddress(), // owner (에스크로를 생성한 주소)
        iouResult.sequence
      );
      console.log("✅ 에스크로 완료 성공!");
      
    } catch (error) {
      console.error("❌ IOU 에스크로 테스트 실패:", error);
    }
    
  } catch (error) {
    console.error("❌ 연결 실패:", error);
  } finally {
    await escrowManager.disconnect();
  }
}

/**
 * IOU 에스크로 테스트 (권한 문제 해결 시도)
 */
async function testIOUEscrow() {
  console.log("\n=== IOU 에스크로 테스트 ===");
  
  const escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED);
  
  try {
    await escrowManager.connect();
    
    // IOU 에스크로 생성 (사용자가 생성하도록 수정)
    console.log("1. IOU 에스크로 생성 중...");
    try {
      const iouResult = await escrowManager.createIOUEscrow(
        "ETF",
        escrowManager.getAdminAddress(), // issuer
        "1", // 작은 금액으로 시도
        escrowManager.getUser2Address(), // destination
        5,  // finishAfter
        30  // cancelAfter
      );
      console.log("✅ IOU 에스크로 생성 성공!");
      console.log("Sequence:", iouResult.sequence);
      
    } catch (error) {
      console.error("❌ IOU 에스크로 생성 실패:", error);
    }
    
  } catch (error) {
    console.error("❌ IOU 에스크로 테스트 실패:", error);
  } finally {
    await escrowManager.disconnect();
  }
}

// 메인 실행 함수
async function main() {
  console.log("🚀 TokenEscrow 간단 테스트 시작\n");
  
  try {
    // 간단한 에스크로 테스트
    await testSimpleEscrow();
    
    // IOU 에스크로 테스트
    await testIOUEscrow();
    
  } catch (error) {
    console.error("❌ 전체 테스트 실패:", error);
  }
  
  console.log("\n🏁 모든 테스트 완료!");
}

// 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}
