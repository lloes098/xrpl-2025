import { Client } from 'xrpl';

/**
 * 최근 ledger에서 실제 MPT 트랜잭션 검색
 */
async function checkRecentLedgers() {
  console.log('🔍 Checking recent ledgers for MPT transactions...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 현재 ledger 정보
    const serverInfo = await client.request({ command: 'server_info' });
    const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
    console.log(`Current ledger: ${currentLedger}`);
    
    // 최근 50개 ledger에서 MPT 트랜잭션 검색
    console.log('\n🔍 Searching for MPT transactions in recent ledgers...');
    
    for (let i = 0; i < 50; i++) {
      const ledgerIndex = currentLedger - i;
      
      try {
        const ledgerData = await client.request({
          command: 'ledger',
          ledger_index: ledgerIndex,
          transactions: true
        });
        
        if (ledgerData.result.ledger.transactions) {
          const mptTransactions = ledgerData.result.ledger.transactions.filter((tx: any) => 
            tx.TransactionType === 'MPTokenIssuanceCreate'
          );
          
          if (mptTransactions.length > 0) {
            console.log(`\n🎯 Found ${mptTransactions.length} MPT transactions in ledger ${ledgerIndex}:`);
            
            mptTransactions.forEach((tx: any, index: number) => {
              console.log(`\n   ${index + 1}. MPT Transaction:`);
              console.log(`      - Hash: ${tx.hash || 'N/A'}`);
              console.log(`      - Account: ${tx.Account || 'N/A'}`);
              console.log(`      - MPT Issuance ID: ${tx.MPTokenIssuanceID || 'N/A'}`);
              console.log(`      - Maximum Amount: ${tx.MaximumAmount || 'N/A'}`);
              console.log(`      - Asset Scale: ${tx.AssetScale || 'N/A'}`);
              console.log(`      - Transfer Fee: ${tx.TransferFee || 'N/A'}`);
              
              if (tx.hash) {
                const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.hash}`;
                console.log(`      - Explorer: ${explorerUrl}`);
              }
            });
          }
        }
      } catch (ledgerError) {
        // 특정 ledger를 찾을 수 없는 경우 무시
        continue;
      }
    }
    
    // 4. 최근 ledger에서 Payment 트랜잭션도 검색 (지갑 펀딩 확인)
    console.log('\n💰 Searching for Payment transactions (wallet funding)...');
    
    for (let i = 0; i < 20; i++) {
      const ledgerIndex = currentLedger - i;
      
      try {
        const ledgerData = await client.request({
          command: 'ledger',
          ledger_index: ledgerIndex,
          transactions: true
        });
        
        if (ledgerData.result.ledger.transactions) {
          const paymentTransactions = ledgerData.result.ledger.transactions.filter((tx: any) => 
            tx.TransactionType === 'Payment' && 
            (tx.Amount === '100000000000' || tx.Amount === '100000000000000') // 100 XRP 또는 100,000 XRP
          );
          
          if (paymentTransactions.length > 0) {
            console.log(`\n💸 Found ${paymentTransactions.length} Payment transactions in ledger ${ledgerIndex}:`);
            
            paymentTransactions.forEach((tx: any, index: number) => {
              console.log(`\n   ${index + 1}. Payment Transaction:`);
              console.log(`      - Hash: ${tx.hash || 'N/A'}`);
              console.log(`      - From: ${tx.Account || 'N/A'}`);
              console.log(`      - To: ${tx.Destination || 'N/A'}`);
              console.log(`      - Amount: ${tx.Amount || 'N/A'} drops`);
              
              if (tx.hash) {
                const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.hash}`;
                console.log(`      - Explorer: ${explorerUrl}`);
              }
            });
          }
        }
      } catch (ledgerError) {
        continue;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
checkRecentLedgers().catch(console.error);
