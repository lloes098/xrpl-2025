import { Client, Wallet } from "xrpl";

/**
 * 송금 함수
 * @param senderSeed 송금자 Seed (s로 시작)
 * @param receiverAddr 수신자 Classic Address (r로 시작)
 * @param amountXRP 송금 금액 (XRP 단위)
 */
export async function pay(senderSeed: string, receiverAddr: string, amountXRP: number) {
  // ── 0) 네트워크 설정: Testnet ───────────────────────────────────────────────
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    // ── 1) 지갑 로딩 ────────────────────────────────────────────────────────
    const senderWallet = Wallet.fromSeed(senderSeed);

    // ── 2) 잔액 확인 함수 ─────────────────────────────────────────────────────
    const getBalanceXRP = async (classicAddress: string): Promise<number> => {
      const accountInfo = await client.request({
        command: "account_info",
        account: classicAddress,
        ledger_index: "validated"
      });
      return parseFloat(accountInfo.result.account_data.Balance) / 1_000_000;
    };

    try {
      const senderBalance = await getBalanceXRP(senderWallet.classicAddress);
      console.log("Sender balance (XRP):", senderBalance);
    } catch (e) {
      console.log("Sender account inactive or not funded on Testnet:", e);
    }

    // 1 XRP = 1,000,000 drops
    const amountDrops = (amountXRP * 1_000_000).toString();

    // ── 3) Payment 트랜잭션 생성 ─────────────────────────────────────────────
    const paymentTx: any = {
      TransactionType: "Payment",
      Account: senderWallet.classicAddress,
      Destination: receiverAddr,
      Amount: amountDrops
    };

    // ── 4) 자동 필드 채움 + 서명 ─────────────────────────────────────────────
    const prepared = await client.autofill(paymentTx);
    const signed = senderWallet.sign(prepared);

    // ── 5) 제출 + 합의까지 대기 ─────────────────────────────────────────────
    const result = await client.submitAndWait(signed.tx_blob);
    console.log("Engine result:", (result.result as any).engine_result);

    // ── 6) 결과 검증: Tx 상세 / 최종 성공 tesSUCCESS 확인 ─────────────────────
    const txHash = signed.hash;
    console.log("Tx hash:", txHash);

    const txLookup = await client.request({
      command: "tx",
      transaction: txHash,
      binary: false
    });
    console.log("Tx result:", (txLookup.result.meta as any)?.TransactionResult);

    // ── 7) 송금 후 잔액 확인 ─────────────────────────────────────────────
    try {
      console.log("Sender balance (XRP) after:", await getBalanceXRP(senderWallet.classicAddress));
      console.log("Receiver balance (XRP) after:", await getBalanceXRP(receiverAddr));
    } catch (e) {
      console.log("Receiver balance check error:", e);
    }
  } finally {
    client.disconnect();
  }
}
