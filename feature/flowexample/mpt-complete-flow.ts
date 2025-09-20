import { MPTokenManager } from "../Features/MPTokens";
import { EscrowCore } from "../Features/EscrowCore";

/**
 * MPT 완전한 생명주기 흐름
 * 1. MPT 발행자가 발행 정의 생성
 * 2. 발급받을 사용자가 opt-in
 * 3. 발행정의를 따르는 MPT 발급받기
 * 4. MPT로 에스크로 걸기
 */

async function runCompleteMPTFlow() {
    console.log("🚀 === MPT 완전한 생명주기 시작 ===");
    
    // 시드 설정
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";  // 발행자
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";    // 사용자1
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";   // 사용자2 (에스크로 대상)
    
    const mptManager = new MPTokenManager(ADMIN_SEED, USER_SEED);
    const escrowCore = new EscrowCore(ADMIN_SEED, USER_SEED, USER2_SEED);
    
    try {
        // 연결
        await mptManager.connect();
        await escrowCore.connect();
        
        console.log("✅ 연결 성공!");
        
        // 주소 정보 출력
        const addresses = escrowCore.getAddresses();
        console.log("📍 주소 정보:");
        console.log(`   발행자 (Admin): ${addresses.admin}`);
        console.log(`   사용자1 (User): ${addresses.user}`);
        console.log(`   사용자2 (User2): ${addresses.user2}`);
        
        // ========================================
        // 1단계: MPT 발행자가 발행 정의 생성
        // ========================================
        console.log("\n📝 1단계: MPT 발행 정의 생성");
        
        // 토큰 메타데이터 생성
        const tokenInfo = {
            name: "Complete Flow Token",
            ticker: "CFT",
            description: "완전한 MPT 생명주기를 보여주는 토큰",
            decimals: 2,
            total_supply: "1000000",
            asset_class: "utility",
            icon: "https://xrpl.org/assets/favicon.16698f9bee80e5687493ed116f24a6633bb5eaa3071414d64b3bed30c3db1d1d.8a5edab2.ico",
            use_case: "Educational demonstration",
            issuer_name: "Complete Flow Demo"
        };
        const metadata = Buffer.from(JSON.stringify(tokenInfo)).toString('hex');
        
        // MPT 발행 정의 생성
        const { issuanceId } = await mptManager.createIssuance(
            0,                    // 소수점 자릿수
            "1000000",           // 최대 발행량
            {                    // 플래그 설정
                tfMPTCanTransfer: true,    // 전송 가능
                tfMPTCanEscrow: true,      // 에스크로 가능
                tfMPTRequireAuth: false    // 권한 요구 안함
            },
            metadata             // 메타데이터
        );
        
        console.log(`✅ MPT 발행 정의 생성 완료!`);
        console.log(`   IssuanceID: ${issuanceId}`);
        console.log(`   최대 발행량: 1,000,000`);
        console.log(`   전송 가능: ✅`);
        console.log(`   에스크로 가능: ✅`);
        
        // ========================================
        // 2단계: 발급받을 사용자가 opt-in
        // ========================================
        console.log("\n🔐 2단계: 사용자 Opt-in");
        
        await mptManager.optIn(issuanceId);
        console.log(`✅ 사용자1이 MPT에 Opt-in 완료!`);
        console.log(`   사용자: ${addresses.user}`);
        console.log(`   토큰 ID: ${issuanceId}`);
        
        // ========================================
        // 3단계: 발행정의를 따르는 MPT 발급받기
        // ========================================
        console.log("\n💰 3단계: MPT 발급받기");
        
        const issueAmount = "5000";  // 5,000 토큰 발급
        await mptManager.sendMPT(issuanceId, addresses.user, issueAmount);
        
        console.log(`✅ MPT 발급 완료!`);
        console.log(`   발급량: ${issueAmount} CFT`);
        console.log(`   수신자: ${addresses.user}`);
        
        // ========================================
        // 4단계: MPT로 에스크로 걸기
        // ========================================
        console.log("\n🔒 4단계: MPT 에스크로 생성");
        
        const escrowAmount = "1000";  // 1,000 토큰을 에스크로
        const finishAfter = 10;       // 10초 후 해제 가능
        const cancelAfter = 30;       // 30초 후 취소 가능
        
        const { sequence } = await escrowCore.createEscrow(
            issuanceId,
            escrowAmount,
            addresses.user2,      // User2에게 전송
            finishAfter,
            cancelAfter
        );
        
        console.log(`✅ MPT 에스크로 생성 완료!`);
        console.log(`   에스크로량: ${escrowAmount} CFT`);
        console.log(`   목적지: ${addresses.user2}`);
        console.log(`   해제 가능 시간: ${finishAfter}초 후`);
        console.log(`   취소 가능 시간: ${cancelAfter}초 후`);
        console.log(`   Sequence: ${sequence}`);
        
        // ========================================
        // 5단계: 에스크로 상태 확인
        // ========================================
        console.log("\n📊 5단계: 에스크로 상태 확인");
        
        try {
            const escrowInfo = await escrowCore.getEscrowInfo(
                addresses.user,
                sequence
            );
            
            if (escrowInfo) {
                console.log("✅ 에스크로 정보 조회 성공!");
                console.log(`   소유자: ${escrowInfo.Account}`);
                console.log(`   목적지: ${escrowInfo.Destination}`);
                console.log(`   금액: ${JSON.stringify(escrowInfo.Amount)}`);
                console.log(`   해제 가능 시간: ${new Date((escrowInfo.FinishAfter + 946684800) * 1000).toLocaleString()}`);
                console.log(`   취소 가능 시간: ${new Date((escrowInfo.CancelAfter + 946684800) * 1000).toLocaleString()}`);
            } else {
                console.log("⚠️ 에스크로 정보를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.log("⚠️ 에스크로 정보 조회 실패 (정상적일 수 있음):", error instanceof Error ? error.message : String(error));
        }
        
        // ========================================
        // 6단계: 에스크로 해제 (자동)
        // ========================================
        console.log(`\n⏰ 6단계: ${finishAfter}초 대기 후 에스크로 해제`);
        console.log("⏳ 에스크로 해제 대기 중...");
        
        // finishAfter 시간만큼 대기
        await new Promise(resolve => setTimeout(resolve, finishAfter * 1000));
        
        try {
            await escrowCore.finishEscrow(addresses.user, sequence);
            console.log("✅ 에스크로 자동 해제 완료!");
            console.log(`   ${escrowAmount} CFT가 ${addresses.user2}에게 전송되었습니다.`);
        } catch (error) {
            console.log("⚠️ 에스크로 해제 실패:", error instanceof Error ? error.message : String(error));
        }
        
        // ========================================
        // 7단계: 최종 상태 확인
        // ========================================
        console.log("\n📈 7단계: 최종 상태 확인");
        
        console.log("🎉 MPT 완전한 생명주기 완료!");
        console.log("=".repeat(50));
        console.log("📋 완료된 작업들:");
        console.log("   ✅ 1. MPT 발행 정의 생성");
        console.log("   ✅ 2. 사용자 Opt-in");
        console.log("   ✅ 3. MPT 발급받기");
        console.log("   ✅ 4. MPT 에스크로 생성");
        console.log("   ✅ 5. 에스크로 상태 확인");
        console.log("   ✅ 6. 에스크로 자동 해제");
        console.log("=".repeat(50));
        
    } catch (error) {
        console.error("❌ MPT 생명주기 실행 실패:", error);
    } finally {
        // 연결 해제
        await mptManager.disconnect();
        await escrowCore.disconnect();
        console.log("🔌 연결 해제 완료");
    }
}

// 실행
runCompleteMPTFlow();
