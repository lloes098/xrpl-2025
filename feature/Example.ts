// trustset.ts 예제
import { trustset } from "./trustset";
(async () => {
    await trustset(
        "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", // holderSeed
        "rG5ZCXCbCb3GhYrUe91JvcKARL5QrfGpao", // issuerAddress
        "ETF", // currency
        "1000" // limitValue
    );
})();


// createWallet.ts 예제
import { createWallet } from "./createWallet";
(async () => {
    const newWallet = await createWallet();
    console.log(newWallet);
})();

// getTokenBalance.ts 예제
import { checkTokenBalance } from "./getTokenBalance";
(async () => {
    // (조회하고 싶은 주소)
    await checkTokenBalance("rLiKJX3SoddTwo9sFfaXy7wuaiNZdiPSYW");
})();

// getXRPBalance.ts 예제
import { checkXRPBalance } from "./getXRPBalance";
(async () => {
    const testAddress = "rLiKJX3SoddTwo9sFfaXy7wuaiNZdiPSYW"; // 조회하고 싶은 XRP 주소 입력
    await checkXRPBalance(testAddress);
})();

// makeToken.ts 예제
import { makeToken } from "./makeToken";
(async () => {
    try {
        // 1. 먼저 trustset 설정
        console.log("TrustSet 설정 중...");
        await trustset(
            "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", // holderSeed
            "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", // issuerAddressOrSeed
            "ETF", // currency
            "1000000" // limitValue
        );
        console.log("TrustSet 설정 완료!");
        
        // 2. IOU 토큰 발행
        console.log("IOU 토큰 발행 중...");
        await makeToken("ETF", "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", "10000");
        console.log("IOU 토큰 발행 완료!");
    } catch (error) {
        console.error("makeToken 예제 실패:", error);
    }
})();

// pay.ts 예제
import { pay } from "./pay";
(async () => {
    const WalletSecret = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const ReceiverAddr = "r4aeWS2sCXXjRupQGd9M7xsDqQm";   
    
    if (WalletSecret) {
        // (지갑 secret, 수신자 주소, 송금 금액)
        await pay(WalletSecret, ReceiverAddr, 90);
    }
})();

// payIOU.ts 예제
import { sendIssuedToken } from "./payIOU";
(async () => {
    try {
        // 1. 먼저 trustset 설정
        console.log("TrustSet 설정 중...");
        await trustset(
            "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", // holderSeed
            "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", // issuerAddress
            "ETF", // currency
            "1000000" // limitValue
        );
        console.log("TrustSet 설정 완료!");
        
        // 2. IOU 토큰 전송
        console.log("IOU 토큰 전송 중...");
        await sendIssuedToken("sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", "100");
        console.log("IOU 토큰 전송 완료!");
    } catch (error) {
        console.error("payIOU 예제 실패:", error);
    }
})();



// MPTokens.ts 예제
import { createMPToken, optInMPToken, sendMPToken } from "./Features/MPTokens";
(async () => {
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    
    try {
        // 1. MPT 발행 (metadata 포함)
        const tokenInfo = {
            name: "DevNet Demo Token",
            ticker: "DDT",
            description: "A demonstration Multi-Purpose Token for XRPL Devnet testing",
            decimals: 2,
            total_supply: "100000000", // 1,000,000 units
            asset_class: "other", 
            icon: "https://xrpl.org/assets/favicon.16698f9bee80e5687493ed116f24a6633bb5eaa3071414d64b3bed30c3db1d1d.8a5edab2.ico",
            use_case: "Educational demonstration",
            issuer_name: "yourfavdevrel"
        };
        const metadata = Buffer.from(JSON.stringify(tokenInfo)).toString('hex');
        
        const { issuanceId } = await createMPToken(
            ADMIN_SEED, 
            USER_SEED,
            0,                    // assetScale
            "1000000000",        // maximumAmount
            metadata             // metadata 추가
        );
        console.log("MPT 발행 성공! IssuanceID:", issuanceId);
        
        // 2. Opt-in
        await optInMPToken(USER_SEED, issuanceId);
        console.log("Opt-in 성공!");
        
        // 3. MPT 전송
        const userWallet = require("xrpl").Wallet.fromSeed(USER_SEED);
        await sendMPToken(ADMIN_SEED, USER_SEED, issuanceId, userWallet.address, "1000");
        console.log("MPT 전송 성공!");
        
    } catch (error) {
        console.error("MPT 테스트 실패:", error);
    }
})();

// TokenEscrow.ts 예제
// trustline 먼저 생성해야함
import { 
    createIOUEscrow,
    createMPTEscrow,
    finishEscrow as finishEscrowOld,
    cancelEscrow as cancelEscrowOld,
    getEscrowInfo as getEscrowInfoOld,
    runIOUEscrowLifecycle,
    runMPTEscrowLifecycle,
    TokenEscrowManager 
} from "./Features/TokenEscrow";
(async () => {
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";
    
    try {
        console.log("=== TokenEscrow 예제 시작 ===");
        
        // 1. MPT 에스크로 생성 예제
        console.log("\n1. MPT 에스크로 생성...");
        const user2Wallet = require("xrpl").Wallet.fromSeed(USER2_SEED);
        const mptEscrowResult = await createMPTEscrow(
            ADMIN_SEED,
            USER_SEED,
            USER2_SEED,
            "0060CC6BAC66353D2C0CB91858C578A16979C5B7983107DA", // MPT ID 입력
            "10", // value
            user2Wallet.address, // destination
            5,  // finishAfter (5초 후 자동 완료)
            30  // cancelAfter (30초 후 취소 가능)
        );
        console.log("✅ MPT 에스크로 생성 성공! Sequence:", mptEscrowResult.sequence);
        
        // 2. 에스크로 정보 조회 예제
        console.log("\n2. 에스크로 정보 조회...");
        try {
            const escrowInfo = await getEscrowInfoOld(
                ADMIN_SEED,
                USER_SEED,
                USER2_SEED,
                mptEscrowResult.result?.tx_json?.Account,
                mptEscrowResult.sequence
            );
            console.log("✅ 에스크로 정보 조회 성공!");
            console.log("Escrow Info:", escrowInfo);
        } catch (error) {
            console.log("⚠️ 에스크로 정보 조회 실패 (정상적일 수 있음):", error instanceof Error ? error.message : String(error));
        }
        
        // 3. 전체 생명주기 예제 (권장)
        console.log("\n3. MPT 에스크로 전체 생명주기...");
        await runMPTEscrowLifecycle(
            ADMIN_SEED,
            USER_SEED,
            USER2_SEED,
            "0060CC6BAC66353D2C0CB91858C578A16979C5B7983107DA", // 기존 issuanceId 사용
            "5", // value
            5,  // finishAfter (5초 후 자동 완료)
            30, // cancelAfter (30초 후 취소 가능)
            true // autoFinish (자동 완료)
        );
        console.log("✅ MPT 에스크로 전체 생명주기 완료!");
        
        // 4. TokenEscrowManager 클래스 사용 예제
        console.log("\n4. TokenEscrowManager 클래스 사용...");
        const escrowManager = new TokenEscrowManager(ADMIN_SEED, USER_SEED, USER2_SEED);
        try {
            await escrowManager.connect();
            console.log("✅ 연결 성공!");
            console.log("Admin Address:", escrowManager.getAdminAddress());
            console.log("User Address:", escrowManager.getUserAddress());
            console.log("User2 Address:", escrowManager.getUser2Address());
        } finally {
            await escrowManager.disconnect();
        }
        
        console.log("\n=== TokenEscrow 예제 완료! ===");
        
    } catch (error) {
        console.error("❌ TokenEscrow 예제 실패:", error);
    }
})();

// ========================================
// 새로운 에스크로 기능 예제들
// ========================================

// 1. 에스크로 생성 예제
import { createEscrow } from "./Features/EscrowCore";
(async () => {
    console.log("\n=== 새로운 에스크로 생성 예제 ===");
    
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";
    
    try {
        // MPToken 발행 ID (실제 사용시에는 먼저 MPToken을 발행해야 함)
        const issuanceId = "0060CC6BAC66353D2C0CB91858C578A16979C5B7983107DA";
        const destination = "rLiKJX3SoddTwo9sFfaXy7wuaiNZdiPSYW";
        
        // 에스크로 생성 (5초 후 해제 가능, 30초 후 취소 가능)
        const { sequence } = await createEscrow(
            ADMIN_SEED,
            USER_SEED,
            USER2_SEED,
            issuanceId,
            "100",           // 에스크로할 수량
            destination,     // 목적지 주소
            5,              // 5초 후 해제 가능
            30              // 30초 후 취소 가능
        );
        
        console.log("✅ 에스크로 생성 성공!");
        console.log(`Sequence: ${sequence}`);
        console.log(`목적지: ${destination}`);
        console.log(`수량: 100`);
        console.log(`해제 가능 시간: 5초 후`);
        console.log(`취소 가능 시간: 30초 후`);
        
    } catch (error) {
        console.error("❌ 에스크로 생성 실패:", error);
    }
})();

// 2. 에스크로 완료 예제
import { finishEscrow } from "./Features/EscrowCore";
(async () => {
    console.log("\n=== 새로운 에스크로 완료 예제 ===");
    
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";
    
    try {
        // 에스크로 소유자 주소와 시퀀스 번호 (실제 사용시에는 생성된 에스크로의 정보를 사용)
        const ownerAddress = "r4aeWS2sCXXjRupQGd9M7xsDqQm";
        const sequence = 123456; // 실제 에스크로 생성시 받은 sequence 번호
        
        // 에스크로 완료 (토큰을 목적지로 전송)
        await finishEscrow(
            ADMIN_SEED,
            USER_SEED,
            USER2_SEED,
            ownerAddress,
            sequence
        );
        
        console.log("✅ 에스크로 완료 성공!");
        console.log(`에스크로된 토큰이 목적지로 전송되었습니다.`);
        
    } catch (error) {
        console.error("❌ 에스크로 완료 실패:", error);
    }
})();

// 3. 에스크로 취소 예제
import { cancelEscrow } from "./Features/EscrowCore";
(async () => {
    console.log("\n=== 새로운 에스크로 취소 예제 ===");
    
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";
    
    try {
        // 에스크로 소유자 주소와 시퀀스 번호 (실제 사용시에는 생성된 에스크로의 정보를 사용)
        const ownerAddress = "r4aeWS2sCXXjRupQGd9M7xsDqQm";
        const sequence = 123456; // 실제 에스크로 생성시 받은 sequence 번호
        
        // 에스크로 취소 (토큰을 원래 소유자에게 반환)
        await cancelEscrow(
            ADMIN_SEED,
            USER_SEED,
            USER2_SEED,
            ownerAddress,
            sequence
        );
        
        console.log("✅ 에스크로 취소 성공!");
        console.log(`에스크로된 토큰이 원래 소유자에게 반환되었습니다.`);
        
    } catch (error) {
        console.error("❌ 에스크로 취소 실패:", error);
    }
})();

// 4. 에스크로 정보 조회 예제
import { getEscrowInfo } from "./Features/EscrowCore";
(async () => {
    console.log("\n=== 새로운 에스크로 정보 조회 예제 ===");
    
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";
    
    try {
        // 에스크로 소유자 주소와 시퀀스 번호 (실제 사용시에는 생성된 에스크로의 정보를 사용)
        const ownerAddress = "r4aeWS2sCXXjRupQGd9M7xsDqQm";
        const sequence = 123456; // 실제 에스크로 생성시 받은 sequence 번호
        
        // 에스크로 정보 조회
        const escrowInfo = await getEscrowInfo(
            ADMIN_SEED,
            USER_SEED,
            USER2_SEED,
            ownerAddress,
            sequence
        );
        
        if (escrowInfo) {
            console.log("✅ 에스크로 정보 조회 성공!");
            console.log("에스크로 정보:");
            console.log(`  - 소유자: ${escrowInfo.Account}`);
            console.log(`  - 목적지: ${escrowInfo.Destination}`);
            console.log(`  - 금액: ${JSON.stringify(escrowInfo.Amount)}`);
            console.log(`  - 해제 가능 시간: ${new Date((escrowInfo.FinishAfter + 946684800) * 1000).toLocaleString()}`);
            console.log(`  - 취소 가능 시간: ${new Date((escrowInfo.CancelAfter + 946684800) * 1000).toLocaleString()}`);
        } else {
            console.log("⚠️ 에스크로 정보를 찾을 수 없습니다.");
        }
        
    } catch (error) {
        console.error("❌ 에스크로 정보 조회 실패:", error);
    }
})();

// 5. EscrowCore 클래스 사용 예제
import { EscrowCore } from "./Features/EscrowCore";
(async () => {
    console.log("\n=== 새로운 EscrowCore 클래스 사용 예제 ===");
    
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const USER_SEED = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW";
    const USER2_SEED = "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V";
    
    const escrowCore = new EscrowCore(ADMIN_SEED, USER_SEED, USER2_SEED);
    
    try {
        await escrowCore.connect();
        console.log("✅ 연결 성공!");
        
        // 주소 정보 확인
        const addresses = escrowCore.getAddresses();
        console.log("주소 정보:");
        console.log(`  Admin: ${addresses.admin}`);
        console.log(`  User: ${addresses.user}`);
        console.log(`  User2: ${addresses.user2}`);
        
        // MPToken 발행
        console.log("\nMPToken 발행 중...");
        const { issuanceId } = await escrowCore.createMPToken("1000000");
        console.log(`✅ MPToken 발행 완료! ID: ${issuanceId}`);
        
        // Opt-in
        console.log("Opt-in 중...");
        await escrowCore.optIn(issuanceId);
        console.log("✅ Opt-in 완료!");
        
        // 토큰 전송
        console.log("토큰 전송 중...");
        await escrowCore.sendMPT(issuanceId, addresses.user, "1000");
        console.log("✅ 토큰 전송 완료!");
        
        // 에스크로 생성
        console.log("에스크로 생성 중...");
        const { sequence } = await escrowCore.createEscrow(
            issuanceId,
            "500",
            addresses.user2,
            10,  // 10초 후 해제 가능
            60   // 60초 후 취소 가능
        );
        console.log(`✅ 에스크로 생성 완료! Sequence: ${sequence}`);
        
        // 에스크로 해제
        console.log("에스크로 해제 중...");
        await escrowCore.finishEscrow(addresses.user, sequence);
        console.log("✅ 에스크로 해제 완료!");
        
    } catch (error) {
        console.error("❌ EscrowCore 예제 실패:", error);
    } finally {
        await escrowCore.disconnect();
    }
})();

// ========================================
// 사용법 가이드
// ========================================
console.log(`
=== XRPL 에스크로 기능 사용법 ===

1. 에스크로 생성 (createEscrow):
   - MPToken을 일정 시간 동안 잠금
   - finishAfter: 해제 가능 시간 (초)
   - cancelAfter: 취소 가능 시간 (초)
   - cancelAfter는 finishAfter보다 나중이어야 함

2. 에스크로 완료 (finishEscrow):
   - 잠긴 토큰을 목적지로 전송
   - finishAfter 시간이 지난 후에만 가능

3. 에스크로 취소 (cancelEscrow):
   - 잠긴 토큰을 원래 소유자에게 반환
   - cancelAfter 시간이 지난 후에만 가능

4. 에스크로 정보 조회 (getEscrowInfo):
   - 에스크로의 현재 상태와 정보 확인

주의사항:
- MPToken을 사용하기 전에 먼저 토큰을 발행하고 Opt-in해야 함
- 에스크로 생성시 올바른 issuanceId를 사용해야 함
- 시간 설정시 cancelAfter > finishAfter 이어야 함
`);