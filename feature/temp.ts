// trustset.ts 예제
import { trustset } from "./trustset";
(async () => {
    await trustset(
        "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", // holderSeed
        "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", // issuerAddressorSeed
        "ETF", // currency
        "100000" // limitValue
    );
})();

(async () => {
    await trustset(
        "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", // holderSeed
        "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V", // issuerAddressorSeed
        "ETF", // currency
        "100000" // limitValue
    );
})();

import { 
    createIOUEscrow,
    createMPTEscrow,
    finishEscrow,
    cancelEscrow,
    getEscrowInfo,
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
            const escrowInfo = await getEscrowInfo(
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