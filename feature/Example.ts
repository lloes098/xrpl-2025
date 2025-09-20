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
    // (토큰 심볼, 발행자 시드, 보유자 시드, 발행/지급할 수량)
    await makeToken("ETF", "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", "100000");
})();

// pay.ts 예제
import { pay } from "./pay";
(async () => {
    const WalletSecret = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
    const ReceiverAddr = "r4aeWS2sCXXjRupQGd9LmvPEN9M7xsDqQm";   
    
    if (WalletSecret) {
        // (지갑 secret, 수신자 주소, 송금 금액)
        await pay(WalletSecret, ReceiverAddr, 90);
    }
})();

// payIOU.ts 예제
import { sendIssuedToken } from "./payIOU";
(async () => {
    // (발행자 시드, 보유자 시드, 지급할 수량)
    await sendIssuedToken("sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW", "100000");
})();

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