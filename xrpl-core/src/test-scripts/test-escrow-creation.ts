import { Client, Wallet } from 'xrpl';
import * as crypto from 'crypto';
import * as cc from 'five-bells-condition';

/**
 * 에스크로 생성 및 관리 테스트
 */
async function testEscrowCreation() {
  console.log('🔒 Testing Escrow Creation on Devnet...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    // 1. Devnet 연결
    await client.connect();
    console.log('✅ Connected to Devnet');
    
    // 2. 테스트 지갑들 생성 및 펀딩
    console.log('\n💰 Creating and funding test wallets...');
    const investorWallet = Wallet.generate();
    const projectWallet = Wallet.generate();
    
    console.log(`   - Investor: ${investorWallet.address}`);
    console.log(`   - Project: ${projectWallet.address}`);
    
    // Devnet faucet으로 펀딩
    const investorFund = await client.fundWallet(investorWallet);
    const projectFund = await client.fundWallet(projectWallet);
    console.log(`   - Investor funded: ${investorFund.balance} XRP`);
    console.log(`   - Project funded: ${projectFund.balance} XRP`);
    
    // 3. 크립토 조건 생성
    console.log('\n🔐 Creating crypto condition...');
    const preimageData = crypto.randomBytes(32);
    const fulfillment = new cc.PreimageSha256();
    fulfillment.setPreimage(preimageData);
    
    const condition = {
      conditionHex: fulfillment.getConditionBinary().toString('hex').toUpperCase(),
      fulfillmentHex: fulfillment.serializeBinary().toString('hex').toUpperCase()
    };
    
    console.log(`   - Condition: ${condition.conditionHex}`);
    console.log(`   - Fulfillment: ${condition.fulfillmentHex}`);
    
    // 4. 에스크로 생성
    console.log('\n🔒 Creating Escrow...');
    const escrowAmount = '10000000'; // 10 XRP in drops
    const finishAfter = Math.floor(Date.now() / 1000) + 3600; // 1시간 후
    
    const escrowTx = {
      TransactionType: 'EscrowCreate',
      Account: investorWallet.address,
      Destination: projectWallet.address,
      Amount: escrowAmount,
      Condition: condition.conditionHex,
      FinishAfter: finishAfter
    };
    
    console.log('   - Submitting escrow creation transaction...');
    const escrowResult = await client.submitAndWait(escrowTx as any, { wallet: investorWallet });
    
    if (escrowResult.result.validated) {
      console.log('✅ Escrow created successfully!');
      console.log(`   - Transaction Hash: ${escrowResult.result.hash}`);
      console.log(`   - Ledger Index: ${escrowResult.result.ledger_index}`);
      console.log(`   - Amount: ${escrowAmount} drops (10 XRP)`);
      console.log(`   - Finish After: ${new Date(finishAfter * 1000).toISOString()}`);
      
      // 5. 에스크로 정보 조회
      console.log('\n📋 Checking escrow info...');
      const accountObjects = await client.request({
        command: 'account_objects',
        account: investorWallet.address,
        type: 'escrow'
      });
      
      if (accountObjects.result.account_objects && accountObjects.result.account_objects.length > 0) {
        const escrowObject = accountObjects.result.account_objects[0];
        console.log('✅ Escrow found in account objects:');
        console.log(`   - Escrow ID: ${(escrowObject as any).index}`);
        console.log(`   - Amount: ${(escrowObject as any).Amount}`);
        console.log(`   - Destination: ${(escrowObject as any).Destination}`);
        console.log(`   - Condition: ${(escrowObject as any).Condition}`);
        console.log(`   - Finish After: ${(escrowObject as any).FinishAfter}`);
        
        // 6. 에스크로 완료 테스트
        console.log('\n✅ Testing escrow finish...');
        const finishTx = {
          TransactionType: 'EscrowFinish',
          Account: projectWallet.address,
          Owner: investorWallet.address,
          OfferSequence: (escrowObject as any).PreviousTxnLgrSeq,
          Condition: condition.conditionHex,
          Fulfillment: condition.fulfillmentHex
        };
        
        const finishResult = await client.submitAndWait(finishTx as any, { wallet: projectWallet });
        
        if (finishResult.result.validated) {
          console.log('✅ Escrow finished successfully!');
          console.log(`   - Finish Hash: ${finishResult.result.hash}`);
          console.log(`   - Ledger Index: ${finishResult.result.ledger_index}`);
          
          // 7. 최종 잔액 확인
          console.log('\n📊 Checking final balances...');
          const investorInfo = await client.request({
            command: 'account_info',
            account: investorWallet.address
          });
          const projectInfo = await client.request({
            command: 'account_info',
            account: projectWallet.address
          });
          
          console.log(`   - Investor Balance: ${investorInfo.result.account_data.Balance} drops`);
          console.log(`   - Project Balance: ${projectInfo.result.account_data.Balance} drops`);
        } else {
          console.log('❌ Escrow finish failed');
          console.log(`   - Error: ${(finishResult.result.meta as any)?.TransactionResult}`);
        }
      } else {
        console.log('❌ No escrows found in account objects');
      }
    } else {
      console.log('❌ Escrow creation failed');
      console.log(`   - Error: ${(escrowResult.result.meta as any)?.TransactionResult}`);
    }
    
    // 8. 블록스캔 링크 생성
    console.log('\n🔗 Block Explorer Links:');
    console.log(`   - Escrow Creation: https://devnet.xrpl.org/transactions/${escrowResult.result.hash}`);
    console.log(`   - Investor Account: https://devnet.xrpl.org/accounts/${investorWallet.address}`);
    console.log(`   - Project Account: https://devnet.xrpl.org/accounts/${projectWallet.address}`);
    
    console.log('\n🎉 Escrow test completed!');
    
  } catch (error) {
    console.error('❌ Escrow test failed:', error);
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from Devnet');
  }
}

// 실행
testEscrowCreation().catch(console.error);
