import { Client, Wallet } from "xrpl";

export async function trustset(
  holderSeed: string,
  issuerAddress: string,
  currency: string = "ETF",
  limitValue: string = "1000"
) {
  // 1) XRPL 테스트넷(WS) 연결
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    // 2) 지갑 로드
    const holderWallet = Wallet.fromSeed(holderSeed); // 홀더

    const holder = holderWallet.address;

    // 3) 홀더가 발행자의 IOU를 신뢰하도록 TrustSet
    const trustSetTx = {
      TransactionType: "TrustSet",
      Account: holder,
      LimitAmount: {
        currency: currency,     // IOU 통화 코드 (3글자 ASCII 또는 160-bit HEX)
        issuer: issuerAddress,  // 발행자 주소
        value: limitValue,      // 신뢰 한도
      },
    } as const;

    const prepared = await client.autofill(trustSetTx);
    const signed = holderWallet.sign(prepared);
    const res = await client.submitAndWait(signed.tx_blob);

    const ok = (res.result.meta as any)?.TransactionResult === "tesSUCCESS";
    if (!ok) {
      throw new Error("TrustSet failed: " + ((res.result.meta as any)?.TransactionResult ?? "unknown"));
    }
    console.log("TrustSet success. tx hash:", res.result.hash);

    // (옵션) account_lines 조회 (validated 기준)
    const lines = await client.request({
      command: "account_lines",
      account: holder,
      ledger_index: "validated",
    });

    console.log("Holder account_lines:", JSON.stringify(lines.result, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await client.disconnect();
  }
}
