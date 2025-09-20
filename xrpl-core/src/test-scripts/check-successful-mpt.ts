import { Client } from 'xrpl';

/**
 * 이전에 성공한 MPT 토큰 확인
 */
async function checkSuccessfulMPT() {
  console.log('🔍 Checking previously successful MPT token...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 이전에 성공한 지갑 주소
    const successfulWallet = 'rK7qmv2HdrVVvQQkTQ3QYSZwewZFYfnYVP';
    const successfulTxHash = '6712430CF66F2A6FBC502CF29512342593893C539C54A719F566AC26063BB0C9';
    
    console.log(`\n📊 Checking successful wallet: ${successfulWallet}`);
    console.log(`   - Transaction Hash: ${successfulTxHash}`);
    
    // 1. 지갑 정보
    try {
      const accountInfo = await client.request({
        command: 'account_info',
        account: successfulWallet
      });
      console.log(`   - Balance: ${accountInfo.result.account_data.Balance} drops`);
      console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
      console.log(`   - Ledger Index: ${accountInfo.result.ledger_index}`);
    } catch (error) {
      console.log(`   ❌ Account not found: ${error}`);
    }
    
    // 2. MPT 토큰 조회
    try {
      const mptObjects = await client.request({
        command: 'account_objects',
        account: successfulWallet,
        type: 'mptoken'
      });
      
      if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
        console.log(`\n   ✅ Found ${mptObjects.result.account_objects.length} MPT tokens:`);
        mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
          console.log(`   ${index + 1}. MPT Token:`);
          console.log(`      - Issuance ID: ${mpt.MPTokenIssuanceID}`);
          console.log(`      - Maximum Amount: ${mpt.MaximumAmount}`);
          console.log(`      - Asset Scale: ${mpt.AssetScale}`);
          console.log(`      - Transfer Fee: ${mpt.TransferFee}`);
          console.log(`      - Ledger Index: ${mpt.LedgerIndex}`);
          console.log(`      - Explorer: https://devnet.xrpl.org/objects/${mpt.MPTokenIssuanceID}`);
        });
      } else {
        console.log(`\n   ❌ No MPT tokens found on successful wallet`);
      }
    } catch (error) {
      console.log(`\n   ❌ Error querying MPT tokens: ${error}`);
    }
    
    // 3. 특정 트랜잭션 확인
    try {
      const txInfo = await client.request({
        command: 'tx',
        transaction: successfulTxHash
      });
      
      console.log(`\n   📜 Transaction Details:`);
      console.log(`      - Hash: ${txInfo.result.hash}`);
      console.log(`      - Type: ${(txInfo.result as any).TransactionType || 'N/A'}`);
      console.log(`      - Ledger Index: ${txInfo.result.ledger_index}`);
      console.log(`      - Date: ${(txInfo.result as any).date ? new Date((txInfo.result as any).date * 1000).toISOString() : 'N/A'}`);
      
      if ((txInfo.result as any).TransactionType === 'MPTokenIssuanceCreate') {
        console.log(`      - MPT Issuance ID: ${(txInfo.result as any).MPTokenIssuanceID || 'N/A'}`);
        console.log(`      - Maximum Amount: ${(txInfo.result as any).MaximumAmount || 'N/A'}`);
        console.log(`      - Asset Scale: ${(txInfo.result as any).AssetScale || 'N/A'}`);
        console.log(`      - Transfer Fee: ${(txInfo.result as any).TransferFee || 'N/A'}`);
      }
      
      console.log(`      - Explorer: https://devnet.xrpl.org/transactions/${successfulTxHash}`);
    } catch (error) {
      console.log(`\n   ❌ Error querying transaction: ${error}`);
    }
    
    // 4. 최근 트랜잭션 조회
    try {
      const accountTx = await client.request({
        command: 'account_tx',
        account: successfulWallet,
        limit: 10,
        binary: false
      });
      
      if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
        console.log(`\n   📜 Recent transactions:`);
        accountTx.result.transactions.forEach((tx: any, index: number) => {
          console.log(`   ${index + 1}. Transaction:`);
          console.log(`      - Hash: ${tx.tx_hash || 'N/A'}`);
          console.log(`      - Ledger: ${tx.ledger_index || 'N/A'}`);
          
          if (tx.tx) {
            console.log(`      - Type: ${tx.tx.TransactionType || 'N/A'}`);
            console.log(`      - Date: ${tx.tx.date ? new Date(tx.tx.date * 1000).toISOString() : 'N/A'}`);
            
            if (tx.tx.TransactionType === 'MPTokenIssuanceCreate') {
              console.log(`      - MPT Issuance ID: ${tx.tx.MPTokenIssuanceID || 'N/A'}`);
              console.log(`      - Maximum Amount: ${tx.tx.MaximumAmount || 'N/A'}`);
              console.log(`      - Asset Scale: ${tx.tx.AssetScale || 'N/A'}`);
            }
          }
          
          if (tx.tx_hash) {
            const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.tx_hash}`;
            console.log(`      - Explorer: ${explorerUrl}`);
          }
        });
      }
    } catch (error) {
      console.log(`\n   ❌ Error querying transactions: ${error}`);
    }
    
    // 5. Explorer 링크
    console.log(`\n🌐 Explorer Links:`);
    console.log(`   - Account: https://devnet.xrpl.org/accounts/${successfulWallet}`);
    console.log(`   - Transaction: https://devnet.xrpl.org/transactions/${successfulTxHash}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
checkSuccessfulMPT().catch(console.error);
