import { Client } from 'xrpl';

/**
 * 성공한 프로젝트의 온체인 상태 확인
 */
async function verifySuccessfulProject() {
  console.log('🔍 Verifying successful project on XRPL Devnet...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 성공한 프로젝트의 지갑 주소들
    const founderAddress = 'rp2SVCZhpCZTTUG1FcV1sbZxQMyrHrFxjF';
    const platformAddress = 'rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi';
    const projectId = 'proj_1758380045061_0llwtt2ey';
    const mptId = 'mpt_1758380054148_t17tslo27';
    
    console.log(`\n📊 Checking project: ${projectId}`);
    console.log(`   - MPT ID: ${mptId}`);
    console.log(`   - Founder: ${founderAddress}`);
    console.log(`   - Platform: ${platformAddress}`);
    
    // 1. 창업자 지갑 정보
    console.log('\n👤 Founder wallet status:');
    try {
      const founderInfo = await client.request({
        command: 'account_info',
        account: founderAddress
      });
      console.log(`   - Balance: ${founderInfo.result.account_data.Balance} drops`);
      console.log(`   - Sequence: ${founderInfo.result.account_data.Sequence}`);
      console.log(`   - Ledger Index: ${founderInfo.result.ledger_index}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    // 2. 플랫폼 지갑 정보
    console.log('\n🏦 Platform wallet status:');
    try {
      const platformInfo = await client.request({
        command: 'account_info',
        account: platformAddress
      });
      console.log(`   - Balance: ${platformInfo.result.account_data.Balance} drops`);
      console.log(`   - Sequence: ${platformInfo.result.account_data.Sequence}`);
      console.log(`   - Ledger Index: ${platformInfo.result.ledger_index}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    // 3. 창업자 지갑의 MPT 토큰 조회
    console.log('\n🪙 MPT tokens on founder wallet:');
    try {
      const mptObjects = await client.request({
        command: 'account_objects',
        account: founderAddress,
        type: 'mptoken'
      });
      
      if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
        console.log(`   Found ${mptObjects.result.account_objects.length} MPT tokens:`);
        mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
          console.log(`   ${index + 1}. MPT Token:`);
          console.log(`      - Issuance ID: ${mpt['MPTokenIssuanceID']}`);
          console.log(`      - Maximum Amount: ${mpt.MaximumAmount}`);
          console.log(`      - Asset Scale: ${mpt.AssetScale}`);
          console.log(`      - Transfer Fee: ${mpt.TransferFee}`);
          console.log(`      - Ledger Index: ${mpt.LedgerIndex}`);
          console.log(`      - Explorer: https://devnet.xrpl.org/objects/${mpt.MPTokenIssuanceID}`);
        });
      } else {
        console.log('   No MPT tokens found on founder wallet');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    // 4. 플랫폼 지갑의 MPT 토큰 조회
    console.log('\n🪙 MPT tokens on platform wallet:');
    try {
      const platformMptObjects = await client.request({
        command: 'account_objects',
        account: platformAddress,
        type: 'mptoken'
      });
      
      if (platformMptObjects.result.account_objects && platformMptObjects.result.account_objects.length > 0) {
        console.log(`   Found ${platformMptObjects.result.account_objects.length} MPT tokens:`);
        platformMptObjects.result.account_objects.forEach((mpt: any, index: number) => {
          console.log(`   ${index + 1}. MPT Token:`);
          console.log(`      - Issuance ID: ${mpt['MPTokenIssuanceID']}`);
          console.log(`      - Maximum Amount: ${mpt.MaximumAmount}`);
          console.log(`      - Asset Scale: ${mpt.AssetScale}`);
          console.log(`      - Transfer Fee: ${mpt.TransferFee}`);
          console.log(`      - Ledger Index: ${mpt.LedgerIndex}`);
          console.log(`      - Explorer: https://devnet.xrpl.org/objects/${mpt.MPTokenIssuanceID}`);
        });
      } else {
        console.log('   No MPT tokens found on platform wallet');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    // 5. 창업자 지갑의 최근 트랜잭션 조회
    console.log('\n📜 Recent transactions from founder wallet:');
    try {
      const accountTx = await client.request({
        command: 'account_tx',
        account: founderAddress,
        limit: 10,
        binary: false
      });
      
      if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
        console.log(`   Found ${accountTx.result.transactions.length} transactions:`);
        accountTx.result.transactions.forEach((tx: any, index: number) => {
          console.log(`\n   ${index + 1}. Transaction:`);
          console.log(`      - Hash: ${tx.tx_hash || 'N/A'}`);
          console.log(`      - Ledger: ${tx.ledger_index || 'N/A'}`);
          
          if (tx.tx) {
            console.log(`      - Type: ${tx.tx.TransactionType || 'N/A'}`);
            console.log(`      - Date: ${tx.tx.date ? new Date(tx.tx.date * 1000).toISOString() : 'N/A'}`);
            console.log(`      - Fee: ${tx.tx.Fee || 'N/A'} drops`);
            
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
      } else {
        console.log('   No transactions found');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    // 6. 최근 레저에서 MPT 트랜잭션 검색
    console.log('\n🔍 Searching recent ledgers for MPT transactions...');
    try {
      const serverInfo = await client.request({ command: 'server_info' });
      const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
      console.log(`   Current ledger: ${currentLedger}`);
      
      // 최근 5개 레저 검색
      for (let i = 0; i < 5; i++) {
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
    
    // 7. XRPL Devnet Explorer 링크
    console.log('\n🌐 XRPL Devnet Explorer Links:');
    console.log(`   - Founder Wallet: https://devnet.xrpl.org/accounts/${founderAddress}`);
    console.log(`   - Platform Wallet: https://devnet.xrpl.org/accounts/${platformAddress}`);
    console.log(`   - Project MPT: https://devnet.xrpl.org/objects/${mptId}`);
    console.log(`   - Main Explorer: https://devnet.xrpl.org/`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
verifySuccessfulProject().catch(console.error);
