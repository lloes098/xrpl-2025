import { Client, Wallet } from "xrpl";

export async function sendIssuedToken(senderSeed: string, receiverSeed: string, amount: string) {
  // XRPL 테스트넷 클라이언트 연결 (WebSocket)
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    // 운영자 / 보유자 지갑
    const issuerWallet = Wallet.fromSeed(senderSeed);
    const holderWallet = Wallet.fromSeed(receiverSeed);

    const issuer = issuerWallet.address;
    const holder = holderWallet.address;

    // IOU 송금: 운영자 10,000 TKN을 보유자에게 지급
    const issuePaymentTx = {
      TransactionType: "Payment",
      Account: issuer,        // 보내는 계정 (발행자)
      Destination: holder,    // 받는 계정 (보유자)
      Amount: {
        currency: "ETF",      // 토큰 심볼
        issuer: issuer,       // 발행자 주소
        value: amount,       // 보낼 양 (문자열 사용 권장)
      },
    } as const;

    // 트랜잭션 자동 보정 및 서명
    const prepared = await client.autofill(issuePaymentTx);
    const signed = issuerWallet.sign(prepared);

    // 제출 및 결과 확인
    const response = await client.submitAndWait(signed.tx_blob);

    const txResult = (response.result.meta as any)?.TransactionResult;
    if (txResult === "tesSUCCESS") {
      console.log("IOU Payment Result:", response.result);
    } else {
      console.error("Transaction Failed:", txResult);
    }
  } catch (error) {
    console.error("Error sending IOU:", error);
  } finally {
    await client.disconnect();
  }
}
