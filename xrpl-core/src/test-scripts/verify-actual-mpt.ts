import { Client } from 'xrpl';

/**
 * 실제 성공한 MPT 토큰들 확인
 */
async function verifyActualMPT() {
  console.log('🔍 Verifying actual MPT tokens on XRPL Devnet...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 성공한 프로젝트들의 발행자 지갑들
    const successfulProjects = [
      {
        projectId: 'proj_1758379908511_7y62bp5b9',
        mptId: 'mpt_1758379921017_zd115kdtl',
        issuerWallet: 'rBeN5kMw9Hjx3N4H7x9Nn5mPjdbUNtHj2T'
      },
      {
        projectId: 'proj_1758379963063_4rvof27xo',
        mptId: 'mpt_1758379972148_296g7xbnr', 
        issuerWallet: 'r3uV7cA1sHmBCRgxWTxmrjtWMuqSKiVgF6'
      },
      {
        projectId: 'proj_1758380045061_0llwtt2ey',
        mptId: 'mpt_1758380054148_t17tslo27',
        issuerWallet: 'rPbcEXdtbzJaQmND2R6pkAppZS6AY4Sqdm'
      }
    ];
    
    for (const project of successfulProjects) {
      console.log(`\n📊 Checking project: ${project.projectId}`);
      console.log(`   - MPT ID: ${project.mptId}`);
      console.log(`   - Issuer: ${project.issuerWallet}`);
      
      // 1. 발행자 지갑 정보
      try {
        const accountInfo = await client.request({
          command: 'account_info',
          account: project.issuerWallet
        });
        console.log(`   - Balance: ${accountInfo.result.account_data.Balance} drops`);
        console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
      } catch (error) {
        console.log(`   ❌ Account not found: ${error}`);
        continue;
      }
      
      // 2. MPT 토큰 조회
      try {
        const mptObjects = await client.request({
          command: 'account_objects',
          account: project.issuerWallet,
          type: 'mptoken'
        });
        
        if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
          console.log(`   ✅ Found ${mptObjects.result.account_objects.length} MPT tokens:`);
          mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
            console.log(`      ${index + 1}. MPT Token:`);
            console.log(`         - Issuance ID: ${mpt['MPTokenIssuanceID']}`);
            console.log(`         - Maximum Amount: ${mpt.MaximumAmount}`);
            console.log(`         - Asset Scale: ${mpt.AssetScale}`);
            console.log(`         - Transfer Fee: ${mpt.TransferFee}`);
            console.log(`         - Ledger Index: ${mpt.LedgerIndex}`);
            console.log(`         - Explorer: https://devnet.xrpl.org/objects/${mpt['MPTokenIssuanceID']}`);
          });
        } else {
          console.log(`   ❌ No MPT tokens found on issuer wallet`);
        }
      } catch (error) {
        console.log(`   ❌ Error querying MPT tokens: ${error}`);
      }
      
      // 3. 최근 트랜잭션에서 MPT 생성 확인
      try {
        const accountTx = await client.request({
          command: 'account_tx',
          account: project.issuerWallet,
          limit: 5,
          binary: false
        });
        
        if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
          console.log(`   📜 Recent transactions:`);
          accountTx.result.transactions.forEach((tx: any, index: number) => {
            if (tx.tx && tx.tx.TransactionType === 'MPTokenIssuanceCreate') {
              console.log(`      ${index + 1}. MPT Creation Transaction:`);
              console.log(`         - Hash: ${tx.tx_hash || 'N/A'}`);
              console.log(`         - Ledger: ${tx.ledger_index || 'N/A'}`);
              console.log(`         - MPT Issuance ID: ${tx.tx.MPTokenIssuanceID || 'N/A'}`);
              console.log(`         - Maximum Amount: ${tx.tx.MaximumAmount || 'N/A'}`);
              console.log(`         - Asset Scale: ${tx.tx.AssetScale || 'N/A'}`);
              console.log(`         - Explorer: https://devnet.xrpl.org/transactions/${tx.tx_hash}`);
            }
          });
        }
      } catch (error) {
        console.log(`   ❌ Error querying transactions: ${error}`);
      }
      
      console.log(`   - Account Explorer: https://devnet.xrpl.org/accounts/${project.issuerWallet}`);
      console.log(`   - MPT Object Explorer: https://devnet.xrpl.org/objects/${project.mptId}`);
    }
    
    // 4. 최근 레저에서 모든 MPT 트랜잭션 검색
    console.log('\n🔍 Searching recent ledgers for all MPT transactions...');
    try {
      const serverInfo = await client.request({ command: 'server_info' });
      const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
      console.log(`   Current ledger: ${currentLedger}`);
      
      // 최근 10개 레저 검색
      for (let i = 0; i < 10; i++) {
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
                console.log(`      - Explorer: https://devnet.xrpl.org/transactions/${tx.hash}`);
                console.log(`      - MPT Object: https://devnet.xrpl.org/objects/${tx['MPTokenIssuanceID']}`);
              }
            }
          }
        } catch (error) {
          // 레저를 가져올 수 없는 경우 무시
        }
      }
    } catch (error) {
      console.log(`   ❌ Error searching ledgers: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
verifyActualMPT().catch(console.error);
