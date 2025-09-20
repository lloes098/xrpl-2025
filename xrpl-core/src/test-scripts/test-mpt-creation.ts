import { Client, Wallet } from 'xrpl';

/**
 * MPT 토큰 생성 및 관리 테스트
 */
async function testMPTCreation() {
  console.log('🪙 Testing MPT Token Creation on Devnet...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    // 1. Devnet 연결
    await client.connect();
    console.log('✅ Connected to Devnet');
    
    // 2. 테스트 지갑 생성 및 펀딩
    console.log('\n💰 Creating and funding test wallet...');
    const testWallet = Wallet.generate();
    console.log(`   - Address: ${testWallet.address}`);
    
    // Devnet faucet으로 펀딩
    const fundResult = await client.fundWallet(testWallet);
    console.log(`   - Funded: ${fundResult.balance} XRP`);
    
    // 3. MPT 토큰 생성
    console.log('\n🪙 Creating MPT Token...');
    const mptMetadata = {
      name: 'Test Project Token',
      description: 'A test MPT token for project funding',
      projectId: 'test_project_001',
      totalSupply: 1000000,
      targetAmount: 10000,
      website: 'https://testproject.com',
      logo: 'https://testproject.com/logo.png',
      category: 'Technology',
      tags: ['blockchain', 'defi', 'test'],
      socialLinks: {
        twitter: 'https://twitter.com/testproject',
        discord: 'https://discord.gg/testproject'
      }
    };
    
    // 메타데이터를 hex로 변환
    const metadataJson = JSON.stringify(mptMetadata);
    const metadataHex = Buffer.from(metadataJson, 'utf8').toString('hex').toUpperCase();
    
    const mptCreateTx = {
      TransactionType: 'MPTokenIssuanceCreate',
      Account: testWallet.address,
      AssetScale: 2, // 소수점 자릿수
      MaximumAmount: mptMetadata.totalSupply.toString(),
      TransferFee: 0, // 전송 수수료
      Flags: 0, // 플래그
      MPTokenMetadata: metadataHex
    };
    
    console.log('   - Submitting MPT creation transaction...');
    const mptResult = await client.submitAndWait(mptCreateTx as any, { wallet: testWallet });
    
    if (mptResult.result.validated) {
      console.log('✅ MPT Token created successfully!');
      console.log(`   - Transaction Hash: ${mptResult.result.hash}`);
      console.log(`   - Ledger Index: ${mptResult.result.ledger_index}`);
      
      // 4. MPT 토큰 정보 조회
      console.log('\n📋 Checking MPT token info...');
      const accountObjects = await client.request({
        command: 'account_objects',
        account: testWallet.address,
        type: 'mptoken'
      });
      
      if (accountObjects.result.account_objects && accountObjects.result.account_objects.length > 0) {
        const mptObject = accountObjects.result.account_objects[0];
        console.log('✅ MPT Token found in account objects:');
        console.log(`   - MPT Issuance ID: ${(mptObject as any).MPTokenIssuanceID}`);
        console.log(`   - Maximum Amount: ${(mptObject as any).MaximumAmount}`);
        console.log(`   - Asset Scale: ${(mptObject as any).AssetScale}`);
        console.log(`   - Transfer Fee: ${(mptObject as any).TransferFee}`);
        
        // 5. MPT 토큰 전송 테스트
        console.log('\n💸 Testing MPT token transfer...');
        const recipientWallet = Wallet.generate();
        console.log(`   - Recipient: ${recipientWallet.address}`);
        
        const mptTransferTx = {
          TransactionType: 'Payment',
          Account: testWallet.address,
          Destination: recipientWallet.address,
          Amount: {
            mpt_issuance_id: (mptObject as any).MPTokenIssuanceID,
            value: '1000' // 1000 토큰 전송
          },
          Fee: '12'
        };
        
        const transferResult = await client.submitAndWait(mptTransferTx as any, { wallet: testWallet });
        
        if (transferResult.result.validated) {
          console.log('✅ MPT Token transfer successful!');
          console.log(`   - Transfer Hash: ${transferResult.result.hash}`);
          
          // 6. 수신자 계정의 MPT 잔액 확인
          console.log('\n📊 Checking recipient MPT balance...');
          const recipientObjects = await client.request({
            command: 'account_objects',
            account: recipientWallet.address,
            type: 'mptoken'
          });
          
          if (recipientObjects.result.account_objects && recipientObjects.result.account_objects.length > 0) {
            const recipientMpt = recipientObjects.result.account_objects[0];
            console.log(`   - Recipient MPT Balance: ${(recipientMpt as any).MPTAmount || '0'}`);
          } else {
            console.log('   - Recipient has no MPT tokens (may need trust line)');
          }
        } else {
          console.log('❌ MPT Token transfer failed');
        }
      } else {
        console.log('❌ No MPT tokens found in account objects');
      }
    } else {
      console.log('❌ MPT Token creation failed');
      console.log(`   - Error: ${(mptResult.result.meta as any)?.TransactionResult}`);
    }
    
    // 7. 블록스캔 링크 생성
    console.log('\n🔗 Block Explorer Links:');
    console.log(`   - XRPL Devnet Explorer: https://devnet.xrpl.org/transactions/${mptResult.result.hash}`);
    console.log(`   - Account: https://devnet.xrpl.org/accounts/${testWallet.address}`);
    
    console.log('\n🎉 MPT Token test completed!');
    
  } catch (error) {
    console.error('❌ MPT test failed:', error);
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from Devnet');
  }
}

// 실행
testMPTCreation().catch(console.error);
