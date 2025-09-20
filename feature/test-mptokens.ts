import { 
  createMPToken, 
  optInMPToken, 
  sendMPToken, 
  authorizeMPToken, 
  destroyMPToken,
  MPTokenManager 
} from "./Features/MPTokens";

// 테스트용 시드들
const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";

/**
 * MPTokens 개별 기능 테스트
 */
async function testIndividualFunctions() {
  console.log("=== MPTokens 개별 기능 테스트 ===");
  
  try {
    // 1. MPT 발행
    console.log("1. MPT 발행 중...");
    const tokenInfo = {
      name: "Test MPT Token",
      ticker: "TMPT",
      description: "A test Multi-Purpose Token",
      decimals: 2,
      total_supply: "1000000",
      asset_class: "other",
      use_case: "Testing"
    };
    const metadata = Buffer.from(JSON.stringify(tokenInfo)).toString('hex');
    
    const { result, issuanceId } = await createMPToken(
      ADMIN_SEED,
      USER_SEED,
      0,                    // assetScale
      "1000000000",        // maximumAmount
      metadata             // metadata
    );
    
    console.log("✅ MPT 발행 성공!");
    console.log("IssuanceID:", issuanceId);
    
    // 2. 수신자 opt-in
    console.log("\n2. 수신자 opt-in 중...");
    await optInMPToken(USER_SEED, issuanceId);
    console.log("✅ Opt-in 성공!");
    
    // 3. 잠시 대기
    console.log("\n3. 3초 대기 중...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. MPT 전송
    console.log("\n4. MPT 전송 중...");
    const userWallet = require("xrpl").Wallet.fromSeed(USER_SEED);
    await sendMPToken(
      ADMIN_SEED,
      USER_SEED,
      issuanceId,
      userWallet.address,
      "1000",
      true // fromAdmin
    );
    console.log("✅ MPT 전송 성공!");
    
    // 5. 권한 부여 (선택사항)
    console.log("\n5. 권한 부여 중...");
    await authorizeMPToken(
      ADMIN_SEED,
      issuanceId,
      userWallet.address,
      false // isUnauthorize
    );
    console.log("✅ 권한 부여 성공!");
    
    console.log("\n=== 모든 테스트 완료! ===");
    
  } catch (error) {
    console.error("❌ 테스트 실패:", error);
  }
}

/**
 * MPTokenManager 클래스 사용 테스트
 */
async function testMPTokenManager() {
  console.log("\n=== MPTokenManager 클래스 테스트 ===");
  
  const mptManager = new MPTokenManager(ADMIN_SEED, USER_SEED);
  
  try {
    await mptManager.connect();
    
    // 1. 발행 생성
    console.log("1. 발행 생성 중...");
    const { issuanceId } = await mptManager.createIssuance();
    console.log("✅ 발행 생성 성공! IssuanceID:", issuanceId);
    
    // 2. Opt-in
    console.log("\n2. Opt-in 중...");
    await mptManager.optIn(issuanceId);
    console.log("✅ Opt-in 성공!");
    
    // 3. MPT 전송
    console.log("\n3. MPT 전송 중...");
    await mptManager.sendMPT(issuanceId, mptManager.getUserAddress()!, "500");
    console.log("✅ MPT 전송 성공!");
    
    console.log("\n=== MPTokenManager 테스트 완료! ===");
    
  } catch (error) {
    console.error("❌ MPTokenManager 테스트 실패:", error);
  } finally {
    await mptManager.disconnect();
  }
}

/**
 * 전체 생명주기 테스트
 */
async function testFullLifecycle() {
  console.log("\n=== MPT 전체 생명주기 테스트 ===");
  
  const mptManager = new MPTokenManager(ADMIN_SEED, USER_SEED);
  
  try {
    await mptManager.connect();
    
    // 전체 생명주기 실행
    await mptManager.runFullLifecycle("2000");
    console.log("✅ 전체 생명주기 테스트 완료!");
    
  } catch (error) {
    console.error("❌ 전체 생명주기 테스트 실패:", error);
  } finally {
    await mptManager.disconnect();
  }
}

// 메인 실행 함수
async function main() {
  console.log("🚀 MPTokens 테스트 시작\n");
  
  try {
    // 개별 기능 테스트
    await testIndividualFunctions();
    
    // MPTokenManager 클래스 테스트
    await testMPTokenManager();
    
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
  testMPTokenManager,
  testFullLifecycle
};
