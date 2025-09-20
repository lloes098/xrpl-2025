// npm install xrpl
import { Client } from "xrpl";

/**
 * 특정 계정의 XRP 잔액을 조회하는 함수
 * @param addr XRPL 주소 (r로 시작)
 */
export async function checkXRPBalance(addr: string) {
  // XRPL 테스트넷 WebSocket 클라이언트
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    // AccountInfo 요청
    const response = await client.request({
      command: "account_info",
      account: addr,
      ledger_index: "validated",
      strict: true,
    });

    // XRPL 잔액은 drops 단위 → 1 XRP = 1,000,000 drops
    const balanceDrops = response.result.account_data.Balance;
    const balanceXRP = Number(balanceDrops) / 1_000_000;

    console.log(`Balance of ${addr}: ${balanceDrops} drops (${balanceXRP} XRP)`);

    return {
      drops: balanceDrops,
      xrp: balanceXRP,
    };
  } catch (error) {
    console.error("Error fetching XRP balance:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
}


(async () => {
  const testAddress = "rLiKJX3SoddTwo9sFfaXy7wuaiNZdiPSYW"; // 확인하고 싶은 주소 입력
  await checkXRPBalance(testAddress);
})();

