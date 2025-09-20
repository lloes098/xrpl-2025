import { Client } from 'xrpl';

/**
 * XRPL Devnet에서 실제 트랜잭션 확인
 */
async function checkOnchainTransactions() {
  console.log('🔍 Checking on-chain transactions on XRPL Devnet...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 성공한 프로젝트의 발행자 지갑 주소
    const issuerWallet = 'rK7qmv2HdrVVvQQkTQ3QYSZwewZFYfnYVP';
    const platformWallet = 'rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi';
    
    console.log(`\n📊 Checking transactions for issuer wallet: ${issuerWallet}`);
    
    // 1. 계정 정보 조회
    const accountInfo = await client.request({
      command: 'account_info',
      account: issuerWallet
    });
    
    console.log('✅ Account Info:');
    console.log(`   - Address: ${accountInfo.result.account_data.Account}`);
    console.log(`   - Balance: ${accountInfo.result.account_data.Balance} drops`);
    console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
    console.log(`   - Ledger Index: ${accountInfo.result.ledger_index}`);
    
    // 2. 계정 트랜잭션 히스토리 조회 (binary: false로 설정)
    console.log('\n📜 Recent transactions:');
    const accountTx = await client.request({
      command: 'account_tx',
      account: issuerWallet,
      limit: 10,
      binary: false
    });
    
    if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
      console.log(`   Found ${accountTx.result.transactions.length} transactions:`);
      
      accountTx.result.transactions.forEach((tx: any, index: number) => {
        console.log(`\n   ${index + 1}. Transaction:`);
        console.log(`      - Hash: ${tx.tx_hash || 'N/A'}`);
        console.log(`      - Ledger Index: ${tx.ledger_index || 'N/A'}`);
        
        if (tx.tx) {
          const txData = tx.tx;
          console.log(`      - Type: ${txData.TransactionType || 'N/A'}`);
          console.log(`      - Date: ${txData.date ? new Date(txData.date * 1000).toISOString() : 'N/A'}`);
          console.log(`      - Fee: ${txData.Fee || 'N/A'} drops`);
          
          if (txData.TransactionType === 'MPTokenIssuanceCreate') {
            console.log(`      - MPT Issuance ID: ${txData.MPTokenIssuanceID || 'N/A'}`);
            console.log(`      - Maximum Amount: ${txData.MaximumAmount || 'N/A'}`);
            console.log(`      - Asset Scale: ${txData.AssetScale || 'N/A'}`);
          }
        }
        
        // XRPL Devnet Explorer 링크 생성
        if (tx.tx_hash) {
          const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.tx_hash}`;
          console.log(`      - Explorer: ${explorerUrl}`);
        }
      });
    } else {
      console.log('   No transactions found');
    }
    
    // 3. MPT 토큰 정보 조회
    console.log('\n🪙 MPT Token information:');
    const mptObjects = await client.request({
      command: 'account_objects',
      account: issuerWallet,
      type: 'mptoken'
    });
    
    if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
      console.log(`   Found ${mptObjects.result.account_objects.length} MPT tokens:`);
      
      mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
        console.log(`\n   ${index + 1}. MPT Token:`);
        console.log(`      - Issuance ID: ${mpt.MPTokenIssuanceID}`);
        console.log(`      - Maximum Amount: ${mpt.MaximumAmount}`);
        console.log(`      - Asset Scale: ${mpt.AssetScale}`);
        console.log(`      - Transfer Fee: ${mpt.TransferFee}`);
        console.log(`      - Flags: ${mpt.Flags}`);
        console.log(`      - Ledger Index: ${mpt.LedgerIndex}`);
      });
    } else {
      console.log('   No MPT tokens found');
    }
    
    // 4. 플랫폼 지갑 정보도 확인
    console.log(`\n🏦 Platform wallet info: ${platformWallet}`);
    const platformInfo = await client.request({
      command: 'account_info',
      account: platformWallet
    });
    
    console.log(`   - Balance: ${platformInfo.result.account_data.Balance} drops`);
    console.log(`   - Sequence: ${platformInfo.result.account_data.Sequence}`);
    
  } catch (error) {
    console.error('❌ Error checking transactions:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
checkOnchainTransactions().catch(console.error);
