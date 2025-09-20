import { Client, Wallet } from 'xrpl';

/**
 * 공식 예시 방식으로 MPT 토큰 생성 테스트
 */
async function testOfficialMPT() {
  console.log('🚀 Testing MPT creation with official examples approach...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 1. 테스트 지갑 생성 및 펀딩
    console.log('\n👤 Creating test wallet...');
    const testWallet = Wallet.generate();
    console.log(`   - Address: ${testWallet.address}`);
    console.log(`   - Seed: ${testWallet.seed}`);
    
    // Devnet faucet으로 펀딩
    const fundResult = await client.fundWallet(testWallet);
    console.log(`   - Funded: ${fundResult.balance} XRP`);
    
    // 2. 공식 예시 방식으로 MPT 생성
    console.log('\n🪙 Creating MPT token with official approach...');
    
    // 메타데이터 생성 (공식 방식)
    const metadata = {
      name: "Test MPT Token",
      symbol: "TMPT",
      description: "A test MPT token created with official examples approach",
      project_id: "test_project_001",
      category: "Technology",
      total_supply: 1000000,
      target_amount: 10000,
      token_type: "MPT",
      created_at: new Date().toISOString()
    };
    
    const metadataJson = JSON.stringify(metadata);
    const hexMetadata = Buffer.from(metadataJson, 'utf8').toString('hex');
    console.log(`   - Metadata JSON: ${metadataJson}`);
    console.log(`   - Hex Metadata: ${hexMetadata}`);
    console.log(`   - Hex Length: ${hexMetadata.length} bytes`);
    
    // MPT 발행 트랜잭션 (공식 예시 방식)
    const transaction = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: testWallet.address,
      AssetScale: 0, // 공식 예시는 0
      MaximumAmount: "1000000",
      TransferFee: 0,
      Flags: {
        tfMPTCanTransfer: true,
        tfMPTCanEscrow: true,
        tfMPTRequireAuth: false
      },
      MPTokenMetadata: hexMetadata
    };
    
    console.log('\n📝 Transaction details:');
    console.log(JSON.stringify(transaction, null, 2));
    
    // 3. 공식 방식으로 트랜잭션 제출
    console.log('\n⏳ Submitting transaction...');
    const prepared = await client.autofill(transaction as any);
    console.log('   - Transaction prepared with autofill');
    
    const signed = testWallet.sign(prepared);
    console.log('   - Transaction signed');
    
    const result = await client.submitAndWait(signed.tx_blob);
    console.log('   - Transaction submitted and waiting for validation');
    
    // 4. 결과 확인
    if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
      const meta = result.result.meta as any;
      if (meta.TransactionResult === 'tesSUCCESS') {
        console.log('\n✅ MPT Token created successfully!');
        console.log(`   - Transaction Hash: ${result.result.hash}`);
        console.log(`   - Ledger Index: ${result.result.ledger_index}`);
        
        // MPT 발행 ID 추출
        const mptIssuanceId = meta.mpt_issuance_id;
        if (mptIssuanceId) {
          console.log(`   - MPT Issuance ID: ${mptIssuanceId}`);
          console.log(`   - Explorer: https://devnet.xrpl.org/transactions/${result.result.hash}`);
          console.log(`   - MPT Object: https://devnet.xrpl.org/objects/${mptIssuanceId}`);
        }
        
        // 5. MPT 토큰 확인
        console.log('\n🔍 Verifying MPT token on-chain...');
        const mptObjects = await client.request({
          command: 'account_objects',
          account: testWallet.address,
          type: 'mptoken'
        });
        
        if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
          console.log(`   ✅ Found ${mptObjects.result.account_objects.length} MPT tokens:`);
          mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
            console.log(`   ${index + 1}. MPT Token:`);
            console.log(`      - Issuance ID: ${mpt['MPTokenIssuanceID']}`);
            console.log(`      - Maximum Amount: ${mpt.MaximumAmount}`);
            console.log(`      - Asset Scale: ${mpt.AssetScale}`);
            console.log(`      - Transfer Fee: ${mpt.TransferFee}`);
            console.log(`      - Ledger Index: ${mpt.LedgerIndex}`);
          });
        } else {
          console.log('   ❌ No MPT tokens found on account');
        }
        
      } else {
        console.log(`❌ Transaction failed: ${meta.TransactionResult}`);
        console.log('   - Full result:', JSON.stringify(result.result, null, 2));
      }
    } else {
      console.log('❌ Invalid transaction result format');
      console.log('   - Full result:', JSON.stringify(result.result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
testOfficialMPT().catch(console.error);
