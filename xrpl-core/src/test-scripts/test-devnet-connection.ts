import { Client, Wallet } from 'xrpl';

/**
 * Devnet 연결 및 기본 기능 테스트
 */
async function testDevnetConnection() {
  console.log('🔗 Testing Devnet connection...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    // 1. Devnet 연결
    await client.connect();
    console.log('✅ Connected to Devnet');
    
    // 2. 네트워크 정보 확인
    const serverInfo = await client.request({
      command: 'server_info'
    });
    console.log('📊 Server Info:');
    console.log(`   - Ledger Index: ${serverInfo.result.info.validated_ledger?.seq}`);
    console.log(`   - Network ID: ${serverInfo.result.info.network_id}`);
    console.log(`   - Server State: ${serverInfo.result.info.server_state}`);
    
    // 3. 테스트 지갑 생성
    console.log('\n💰 Creating test wallet...');
    const testWallet = Wallet.generate();
    console.log(`   - Address: ${testWallet.address}`);
    console.log(`   - Public Key: ${testWallet.publicKey}`);
    console.log(`   - Private Key: ${testWallet.privateKey}`);
    
    // 4. 지갑 펀딩 (Devnet Faucet 사용)
    console.log('\n💧 Funding wallet from Devnet faucet...');
    try {
      const fundResult = await client.fundWallet(testWallet);
      console.log('✅ Wallet funded successfully');
      console.log(`   - Balance: ${fundResult.balance} XRP`);
    } catch (error) {
      console.log('⚠️  Faucet funding failed, trying manual funding...');
      // 수동으로 XRP 전송 시도
      const faucetWallet = Wallet.fromSeed('sEdTJSpenzy1XgBAaMufgR6dH4Wj1Z'); // Devnet faucet
      const payment = {
        TransactionType: 'Payment',
        Account: faucetWallet.address,
        Destination: testWallet.address,
        Amount: '1000000000', // 1000 XRP (in drops)
        Fee: '12'
      };
      
      await client.submitAndWait(payment as any, { wallet: faucetWallet });
      console.log('✅ Manual funding successful');
    }
    
    // 5. 계정 정보 확인
    console.log('\n📋 Checking account info...');
    const accountInfo = await client.request({
      command: 'account_info',
      account: testWallet.address
    });
    console.log(`   - Balance: ${accountInfo.result.account_data.Balance} drops`);
    console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
    
    // 6. MPT 기능 테스트 (Devnet에서 지원하는지 확인)
    console.log('\n🪙 Testing MPT support...');
    try {
      const accountObjects = await client.request({
        command: 'account_objects',
        account: testWallet.address,
        type: 'mptoken'
      });
      console.log('✅ MPT support confirmed');
      console.log(`   - MPT objects: ${accountObjects.result.account_objects?.length || 0}`);
    } catch (error) {
      console.log('❌ MPT not supported on this network');
    }
    
    // 7. 간단한 Payment 트랜잭션 테스트
    console.log('\n💸 Testing Payment transaction...');
    const destinationWallet = Wallet.generate();
    const paymentTx = {
      TransactionType: 'Payment',
      Account: testWallet.address,
      Destination: destinationWallet.address, // 새 지갑으로 전송
      Amount: '1000000', // 1 XRP
      Fee: '12'
    };
    
    const paymentResult = await client.submitAndWait(paymentTx as any, { wallet: testWallet });
    console.log('✅ Payment transaction successful');
    console.log(`   - Transaction Hash: ${paymentResult.result.hash}`);
    console.log(`   - Ledger Index: ${paymentResult.result.ledger_index}`);
    console.log(`   - Destination: ${destinationWallet.address}`);
    
    // 8. 트랜잭션 상세 정보 확인
    console.log('\n🔍 Transaction details:');
    const txInfo = await client.request({
      command: 'tx',
      transaction: paymentResult.result.hash
    });
    console.log(`   - Status: ${(txInfo.result.meta as any)?.TransactionResult}`);
    console.log(`   - Fee: ${(txInfo.result as any).Fee} drops`);
    console.log(`   - Sequence: ${(txInfo.result as any).Sequence}`);
    
    console.log('\n🎉 All tests passed! Devnet is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from Devnet');
  }
}

// 실행
testDevnetConnection().catch(console.error);
