// npm install xrpl
import { Client } from "xrpl";

export async function checkTokenBalance(addr: string) {
  // XRPL 테스트넷 WebSocket 연결
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const address = addr;

    // account_lines 요청 (trustline 및 IOU 잔액 조회)
    const lines = await client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated",
    });

    console.log("Holder trust lines:", JSON.stringify(lines.result, null, 2));
    return lines.result;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
}

// 테스트 실행
(async () => {
  const testAddress = "rLiKJX3SoddTwo9sFfaXy7wuaiNZdiPSYW"; // 조회하고 싶은 XRP 주소 입력
  await checkTokenBalance(testAddress);
})();
