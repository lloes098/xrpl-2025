import { 
  createIOUEscrow, 
  createMPTEscrow, 
  finishEscrow, 
  cancelEscrow,
  TokenEscrowManager 
} from "./Features/TokenEscrow";

// 테스트용 시드들
const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";

/**
 * TokenEscrow 개별 기능 테스트
 */
async function testIndividualFunctions() {
  console.log("=== TokenEscrow 개별 기능 테스트 ===");
  
  try {
    // 1. IOU 에스크로 생성
    console.log("1. IOU 에스크로 생성 중...");
    const user2Wallet = require("xrpl").Wallet.fromSeed(USER2_SEED);
    const iouResult = await createIOUEscrow(
      ADMIN_SEED,
      USER_SEED,
      USER2_SEED,
      "ETF",                    // currency
      "rG5ZCXCbCb3GhYrUe91JvcKARL5QrfGpao", // issuer
      "10",                     // value
      user2Wallet.address,      // destination
      5,                        // finishAfter (5초)
      30                        // cancelAfter (30초)
    );
    
    console.log("✅ IOU 에스크로 생성 성공!");
    console.log("Escrow Sequence:", iouResult.result?.tx_json?.Sequence);
    
    // 2. 잠시 대기
    console.log("\n2. 3초 대기 중...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. 에스크로 완료
    console.log("\n3. 에스크로 완료 중...");
    const finishResult = await finishEscrow(
      ADMIN_SEED,
      USER_SEED,
      USER2_SEED,
      iouResult.result?.tx_json?.Account, // owner
      iouResult.result?.tx_json?.Sequence // offerSequence
    );
    
    console.log("✅ 에스크로 완료 성공!");
    
    console.log("\n=== 모든 테스트 완료! ===");
    
  } catch (error) {
    console.error("❌ 테스트 실패:", error);
  }
}

/**
 * TokenEscrowManager 클래스 사용 테스트
 */
async function testTokenEscrowManager() {
  console.log("\n=== TokenEscrowManager 클래스 테스트 ===");
  
  const escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED);
  
  try {
    await escrowManager.connect();
    
    // 1. IOU 에스크로 생성
    console.log("1. IOU 에스크로 생성 중...");
    const iouResult = await escrowManager.createIOUEscrow(
      "ETF",
      escrowManager.getAdminAddress(),
      "5",
      escrowManager.getUser2Address(), // destination
      5,  // finishAfter
      30  // cancelAfter
    );
    
    console.log("✅ IOU 에스크로 생성 성공!");
    console.log("Escrow Sequence:", iouResult.result?.tx_json?.Sequence);
    
    // 2. 잠시 대기
    console.log("\n2. 3초 대기 중...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. 에스크로 완료
    console.log("\n3. 에스크로 완료 중...");
    const finishResult = await escrowManager.finishEscrow(
      iouResult.result?.tx_json?.Account,
      iouResult.result?.tx_json?.Sequence
    );
    
    console.log("✅ 에스크로 완료 성공!");
    
    console.log("\n=== TokenEscrowManager 테스트 완료! ===");
    
  } catch (error) {
    console.error("❌ TokenEscrowManager 테스트 실패:", error);
  } finally {
    await escrowManager.disconnect();
  }
}

/**
 * 전체 생명주기 테스트
 */
async function testFullLifecycle() {
  console.log("\n=== IOU 에스크로 전체 생명주기 테스트 ===");
  
  const escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED);
  
  try {
    await escrowManager.connect();
    
    // 전체 생명주기 실행
    await escrowManager.runIOUEscrowLifecycle(
      "ETF",
      escrowManager.getAdminAddress(),
      "15",
      5,  // finishAfter
      30, // cancelAfter
      true // autoFinish
    );
    
    console.log("✅ 전체 생명주기 테스트 완료!");
    
  } catch (error) {
    console.error("❌ 전체 생명주기 테스트 실패:", error);
  } finally {
    await escrowManager.disconnect();
  }
}

// 메인 실행 함수
async function main() {
  console.log("🚀 TokenEscrow 테스트 시작\n");
  
  try {
    // 개별 기능 테스트
    await testIndividualFunctions();
    
    // TokenEscrowManager 클래스 테스트
    await testTokenEscrowManager();
    
    // 전체 생명주기 테스트 (선택사항)
    // await testFullLifecycle();
    
  } catch (error) {
    console.error("❌ 전체 테스트 실패:", error);
  }
  
  console.log("\n🏁 모든 테스트 완료!");
}

// 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}

// export for other files
export {
  testIndividualFunctions,
  testTokenEscrowManager,
  testFullLifecycle
};
