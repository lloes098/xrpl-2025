import { Client, Wallet } from "xrpl";

export async function createWallet() {
  // XRPL 테스트넷 노드
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    // Faucet에서 자동으로 XRP가 충전된 지갑 생성
    const fundResult = await client.fundWallet();
    const testWallet: Wallet = fundResult.wallet;

    console.log("Classic Address:", testWallet.classicAddress);
    console.log("Secret:", testWallet.seed);

    // 계정 잔액 및 시퀀스 정보 조회
    const response = await client.request({
      command: "account_info",
      account: testWallet.classicAddress,
      ledger_index: "validated",
      strict: true,
    });

    const accountData = response.result.account_data;
    console.log("Current sequence:", accountData.Sequence);

    return {
      address: testWallet.classicAddress,
      secret: testWallet.seed,
      balance: accountData.Balance,
      sequence: accountData.Sequence,
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
}

// 실행 예시
createWallet().then((result) => {
  console.log("Wallet created successfully:", result);
});