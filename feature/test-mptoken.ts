import { Client, Wallet } from "xrpl";

async function testMPToken() {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const wallet = Wallet.fromSeed("sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc");
    
    console.log("=== MPToken 지원 여부 확인 ===");
    
    // MPTokenIssuanceCreate 시도
    console.log("=== MPTokenIssuanceCreate 시도 ===");
    const tx: any = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: wallet.address,
      AssetScale: 0,
      MaximumAmount: "1000000000"
    };

    try {
      const prepared = await client.autofill(tx);
      console.log("✅ MPTokenIssuanceCreate 지원됨");
      console.log("Prepared transaction:", JSON.stringify(prepared, null, 2));
    } catch (error: any) {
      console.log("❌ MPTokenIssuanceCreate 지원되지 않음");
      console.log("Error:", error.message);
    }

    // 다른 MPToken 트랜잭션 타입들도 테스트
    const mptokenTypes = [
      "MPTokenIssuanceDestroy",
      "MPTokenAuthorize",
      "MPTokenBurn",
      "MPTokenMint"
    ];

    for (const txType of mptokenTypes) {
      console.log(`\n=== ${txType} 테스트 ===`);
      try {
        const testTx: any = {
          TransactionType: txType,
          Account: wallet.address
        };
        await client.autofill(testTx);
        console.log(`✅ ${txType} 지원됨`);
      } catch (error: any) {
        console.log(`❌ ${txType} 지원되지 않음: ${error.message}`);
      }
    }

  } finally {
    await client.disconnect();
  }
}

testMPToken().catch(console.error);
