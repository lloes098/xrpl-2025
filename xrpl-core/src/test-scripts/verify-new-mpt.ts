import { Client } from 'xrpl';

/**
 * 새로 생성된 MPT 토큰 확인
 */
async function verifyNewMPT() {
  console.log('🔍 Verifying newly created MPT token...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 새로 생성된 MPT 발행 ID
    const mptIssuanceId = '0060EBACEB65D4768F6CE66B09F1B06C79F29010795E3B88';
    console.log(`\n📊 Checking MPT: ${mptIssuanceId}`);
    
    // 최근 레저에서 MPT 트랜잭션 검색
    const serverInfo = await client.request({ command: 'server_info' });
    const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
    console.log(`   Current ledger: ${currentLedger}`);
    
    console.log('\n🔍 Searching recent ledgers for MPT transactions...');
    const numLedgersToCheck = 20;
    let found = false;
    
    for (let i = 0; i < numLedgersToCheck; i++) {
      const ledgerIndex = currentLedger - i;
      if (ledgerIndex <= 0) break;
      
      try {
        const ledger = await client.request({
          command: 'ledger',
          ledger_index: ledgerIndex,
          transactions: true,
          expand: true
        });
        
        if (ledger.result.ledger.transactions) {
          for (const tx of ledger.result.ledger.transactions) {
            if (tx.TransactionType === 'MPTokenIssuanceCreate') {
              console.log(`\n   ✅ Found MPT Issuance in ledger ${ledgerIndex}:`);
              console.log(`      - Hash: ${tx.hash}`);
              console.log(`      - Issuer: ${tx.Account}`);
              console.log(`      - MPT Issuance ID: ${tx['MPTokenIssuanceID']}`);
              console.log(`      - Maximum Amount: ${tx.MaximumAmount}`);
              console.log(`      - Asset Scale: ${tx.AssetScale}`);
              console.log(`      - Transfer Fee: ${tx.TransferFee}`);
              console.log(`      - Explorer: https://devnet.xrpl.org/transactions/${tx.hash}`);
              console.log(`      - MPT Object: https://devnet.xrpl.org/objects/${tx['MPTokenIssuanceID']}`);
              
              // 발행자 지갑의 MPT 토큰 확인
              try {
                const mptObjects = await client.request({
                  command: 'account_objects',
                  account: tx.Account,
                  type: 'mptoken'
                });
                
                if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
                  console.log(`\n   ✅ Found ${mptObjects.result.account_objects.length} MPT tokens on issuer wallet:`);
                  mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
                    console.log(`      ${index + 1}. MPT Token:`);
                    console.log(`         - Issuance ID: ${mpt['MPTokenIssuanceID']}`);
                    console.log(`         - Maximum Amount: ${mpt.MaximumAmount}`);
                    console.log(`         - Asset Scale: ${mpt.AssetScale}`);
                    console.log(`         - Transfer Fee: ${mpt.TransferFee}`);
                    console.log(`         - Ledger Index: ${mpt.LedgerIndex}`);
                  });
                } else {
                  console.log(`\n   ❌ No MPT tokens found on issuer wallet`);
                }
              } catch (error) {
                console.log(`\n   ❌ Error checking MPT tokens: ${(error as Error).message}`);
              }
              
              found = true;
              break;
            }
          }
        }
      } catch (error) {
        // 레저를 가져올 수 없는 경우 무시
      }
      
      if (found) break;
    }
    
    if (!found) {
      console.log('\n   ❌ No MPT Issuance transactions found in recent ledgers');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
verifyNewMPT().catch(console.error);
