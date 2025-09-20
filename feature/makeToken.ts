import { Client, Wallet } from "xrpl";

/**
 * XRPL Testnet에서 IOU 토큰을 발행(issuer -> holder 지급)하는 함수
 * @param currency   예: "USD", "ETF" (3글자 ASCII 권장. 160-bit HEX도 가능)
 * @param coldSeed   발행자(issuer, cold wallet) 시드 (sXXXX...)
 * @param hotSeed    보유자(holder, hot wallet) 시드 (sXXXX...)
 * @param amount     발행/지급할 수량(문자열 권장: 소수 포함 시 문자열 필수)
 */
export async function makeToken(
  currency: string,
  coldSeed: string,
  hotSeed: string,
  amount: string
) {
  const JSON_RPC_URL = "wss://s.devnet.rippletest.net:51233";
  const client = new Client(JSON_RPC_URL);
  await client.connect();

  try {
    // 1) 지갑 로드
    const issuerWallet = Wallet.fromSeed(coldSeed); // 발행자
    const holderWallet = Wallet.fromSeed(hotSeed);  // 보유자

    const issuer = issuerWallet.address;
    const holder = holderWallet.address;

    // 2) (보유자 측) 트러스트라인 생성
    const trustSetTx = {
      TransactionType: "TrustSet",
      Account: holder,
      LimitAmount: {
        currency,         // "USD" | "ETF" | 160-bit HEX
        issuer: issuer,   // 발행자 주소
        value: "1000000", // 한도 (충분히 크게)
      },
    } as const;

    const trustPrepared = await client.autofill(trustSetTx);
    const trustSigned = holderWallet.sign(trustPrepared);
    const trustResult = await client.submitAndWait(trustSigned.tx_blob);

    const trustOK = trustResult?.result?.meta && typeof trustResult.result.meta === 'object' && 'TransactionResult' in trustResult.result.meta && trustResult.result.meta.TransactionResult === "tesSUCCESS";
    if (!trustOK) {
      const errorMsg = trustResult?.result?.meta && typeof trustResult.result.meta === 'object' && 'TransactionResult' in trustResult.result.meta ? trustResult.result.meta.TransactionResult : "unknown";
      console.log("TrustSet 실패 상세 정보:", JSON.stringify(trustResult.result, null, 2));
      throw new Error("TrustSet failed: " + errorMsg);
    } else {
      console.log("✅ TrustSet 성공!");
    }

    // 3) (발행자 측) IOU 발행/지급 (Payment with Issued Currency)
    // 먼저 발행자가 해당 통화를 발행해야 함
    const paymentTx = {
      TransactionType: "Payment",
      Account: issuer,
      Destination: holder,
      Amount: {
        currency,
        issuer,
        value: amount, // 문자열 사용 권장
      },
    } as const;

    const payPrepared = await client.autofill(paymentTx);
    const paySigned = issuerWallet.sign(payPrepared);
    const payResult = await client.submitAndWait(paySigned.tx_blob);

    const payOK = payResult?.result?.meta && typeof payResult.result.meta === 'object' && 'TransactionResult' in payResult.result.meta && payResult.result.meta.TransactionResult === "tesSUCCESS";
    if (!payOK) {
      const errorMsg = payResult?.result?.meta && typeof payResult.result.meta === 'object' && 'TransactionResult' in payResult.result.meta ? payResult.result.meta.TransactionResult : "unknown";
      console.log("Payment 실패 상세 정보:", JSON.stringify(payResult.result, null, 2));
      throw new Error("Payment (issue IOU) failed: " + errorMsg);
    }

    // 4) (검증) 보유자 trust lines 조회
    const lines = await client.request({
      command: "account_lines",
      account: holder,
    });

    console.log("\nHolder trust lines:", JSON.stringify(lines.result, null, 2), "\n");

    return {
      trustTxHash: trustResult?.result?.tx_json?.hash,
      paymentTxHash: payResult?.result?.tx_json?.hash,
      lines: lines.result,
    };
  } finally {
    try { await client.disconnect(); } catch {}
  }
}

// 사용 예시:
(async () => {
    // 실제 테스트넷 지갑 시드
    const testIssuerSeed = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc"; // 발행자 시드
    const testHolderSeed = "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW"; // 보유자 시드
    
    try {
        console.log("토큰 발행 시작...");
        const result = await makeToken("DDT", testIssuerSeed, testHolderSeed, "100000");
        console.log("토큰 발행 성공!");
        console.log("TrustSet 트랜잭션 해시:", result.trustTxHash);
        console.log("Payment 트랜잭션 해시:", result.paymentTxHash);
    } catch (error) {
        console.error("토큰 발행 실패:", error);
    }
})();