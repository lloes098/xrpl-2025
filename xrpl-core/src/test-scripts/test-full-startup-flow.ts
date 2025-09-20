import { Client, Wallet } from 'xrpl';
import axios from 'axios';

/**
 * 창업 프로젝트 전체 흐름 검증
 * 1. 프로젝트 생성 (MPT 토큰 발행)
 * 2. 투자 처리 (에스크로 생성)
 * 3. 마일스톤 달성 (에스크로 완료)
 * 4. 수익 분배 (배치 트랜잭션)
 */
async function testFullStartupFlow() {
  console.log('🚀 Testing Full Startup Project Flow on XRPL Devnet...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 1. 창업자 지갑 생성 및 펀딩
    console.log('\n👤 Creating founder wallet...');
    const founderWallet = Wallet.generate();
    console.log(`   - Founder Address: ${founderWallet.address}`);
    console.log(`   - Founder Seed: ${founderWallet.seed}`);
    
    const fundResult = await client.fundWallet(founderWallet);
    console.log(`   - Funded: ${fundResult.balance} XRP`);
    
    // 2. 투자자 지갑들 생성 및 펀딩
    console.log('\n💰 Creating investor wallets...');
    const investors = [];
    for (let i = 0; i < 3; i++) {
      const investorWallet = Wallet.generate();
      await client.fundWallet(investorWallet);
      investors.push({
        address: investorWallet.address,
        seed: investorWallet.seed,
        name: `Investor ${i + 1}`
      });
      console.log(`   - ${investors[i].name}: ${investorWallet.address}`);
    }
    
    // 3. 실제 창업 프로젝트 데이터
    const startupProjectData = {
      name: 'AI-Powered Healthcare Platform',
      description: 'Revolutionary AI system for early disease detection using machine learning algorithms to analyze medical images and patient data. Our platform aims to reduce diagnostic errors by 40% and improve patient outcomes.',
      targetAmount: 500000, // 500,000 XRP
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90일 후
      creatorWallet: founderWallet.address,
      website: 'https://aihealthcare.com',
      logo: 'https://aihealthcare.com/logo.png',
      category: 'Healthcare Technology',
      tags: ['AI', 'Healthcare', 'Machine Learning', 'Medical Technology', 'Diagnostics'],
      socialLinks: {
        twitter: 'https://twitter.com/aihealthcare',
        linkedin: 'https://linkedin.com/company/aihealthcare',
        github: 'https://github.com/aihealthcare',
        discord: 'https://discord.gg/aihealthcare'
      },
      tokenomics: {
        totalTokens: 10000000, // 1천만 토큰
        tokenPrice: 0.05, // 토큰당 0.05 XRP
        platformTokenShare: 0.1, // 플랫폼 10%
        creatorTokenShare: 0.2, // 창업자 20%
        investorTokenShare: 0.7 // 투자자 70%
      },
      milestones: [
        {
          name: 'MVP Development',
          description: 'Complete minimum viable product with core AI algorithms for image analysis',
          targetAmount: 100000,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Clinical Trials Phase 1',
          description: 'Begin clinical trials with partner hospitals and medical institutions',
          targetAmount: 200000,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'FDA Approval Process',
          description: 'Obtain FDA approval for medical device classification',
          targetAmount: 200000,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    // 4. 프로젝트 생성 (MPT 토큰 발행)
    console.log('\n🏗️ Creating startup project...');
    const projectResponse = await axios.post('http://localhost:3001/api/projects', startupProjectData);
    
    if (projectResponse.status === 201) {
      console.log('✅ Project created successfully!');
      console.log(`   - Project ID: ${projectResponse.data.projectId}`);
      console.log(`   - MPT ID: ${projectResponse.data.mptId}`);
      console.log(`   - Project Name: ${projectResponse.data.name}`);
      console.log(`   - Target Amount: ${projectResponse.data.targetAmount} XRP`);
      console.log(`   - Milestones: ${projectResponse.data.milestones.length}`);
      
      const projectId = projectResponse.data.projectId;
      const mptId = projectResponse.data.mptId;
      
      // 5. 투자 처리 (에스크로 생성)
      console.log('\n💸 Processing investments...');
      const investments = [];
      
      for (let i = 0; i < investors.length; i++) {
        const investmentAmount = 50000 + (i * 25000); // 50K, 75K, 100K XRP
        const investmentData = {
          projectId: projectId,
          investorAddress: investors[i].address,
          investorSeed: investors[i].seed,
          amount: investmentAmount,
          milestoneId: projectResponse.data.milestones[0].id // 첫 번째 마일스톤
        };
        
        try {
          const investmentResponse = await axios.post('http://localhost:3001/api/investments', investmentData);
          if (investmentResponse.status === 201) {
            console.log(`   ✅ ${investors[i].name} invested ${investmentAmount} XRP`);
            console.log(`      - Investment ID: ${investmentResponse.data.investmentId}`);
            console.log(`      - Transaction Hash: ${investmentResponse.data.txHash}`);
            investments.push(investmentResponse.data);
          }
        } catch (error) {
          console.log(`   ❌ ${investors[i].name} investment failed: ${error}`);
        }
      }
      
      // 6. 마일스톤 달성 (에스크로 완료)
      console.log('\n🎯 Achieving milestones...');
      try {
        const milestoneResponse = await axios.post(`http://localhost:3001/api/projects/${projectId}/milestones/${projectResponse.data.milestones[0].id}/achieve`, {
          evidence: 'MVP development completed with core AI algorithms successfully implemented and tested',
          proof: 'https://github.com/aihealthcare/mvp-demo'
        });
        
        if (milestoneResponse.status === 200) {
          console.log('✅ First milestone achieved!');
          console.log(`   - Milestone: ${milestoneResponse.data.milestone.name}`);
          console.log(`   - Status: ${milestoneResponse.data.milestone.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Milestone achievement failed: ${error}`);
      }
      
      // 7. 프로젝트 상세 정보 조회
      console.log('\n📊 Project details:');
      try {
        const projectDetails = await axios.get(`http://localhost:3001/api/projects/${projectId}`);
        console.log('   Project Information:');
        console.log(`   - Name: ${projectDetails.data.name}`);
        console.log(`   - Description: ${projectDetails.data.description}`);
        console.log(`   - Target Amount: ${projectDetails.data.targetAmount} XRP`);
        console.log(`   - Current Amount: ${projectDetails.data.currentAmount} XRP`);
        console.log(`   - Status: ${projectDetails.data.status}`);
        console.log(`   - MPT ID: ${projectDetails.data.mptData.mptIssuanceId}`);
        console.log(`   - Milestones: ${projectDetails.data.milestones.length}`);
        console.log(`   - Investors: ${projectDetails.data.investors.size}`);
      } catch (error) {
        console.log(`   ❌ Failed to get project details: ${error}`);
      }
      
      // 8. XRPL Devnet Explorer 링크
      console.log('\n🌐 XRPL Devnet Explorer Links:');
      console.log(`   - Founder Wallet: https://devnet.xrpl.org/accounts/${founderWallet.address}`);
      console.log(`   - Platform Wallet: https://devnet.xrpl.org/accounts/rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi`);
      console.log(`   - Project MPT: https://devnet.xrpl.org/objects/${mptId}`);
      
      investors.forEach((investor, index) => {
        console.log(`   - ${investor.name}: https://devnet.xrpl.org/accounts/${investor.address}`);
      });
      
      // 9. 트랜잭션 검증
      console.log('\n🔍 Verifying transactions on-chain...');
      await verifyTransactionsOnChain(client, founderWallet.address, investors.map(i => i.address));
      
    } else {
      console.log('❌ Project creation failed');
      console.log(projectResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

/**
 * 온체인 트랜잭션 검증
 */
async function verifyTransactionsOnChain(client: Client, founderAddress: string, investorAddresses: string[]) {
  try {
    // 1. 창업자 지갑 정보
    console.log('\n   📊 Founder wallet status:');
    const founderInfo = await client.request({
      command: 'account_info',
      account: founderAddress
    });
    console.log(`      - Balance: ${founderInfo.result.account_data.Balance} drops`);
    console.log(`      - Sequence: ${founderInfo.result.account_data.Sequence}`);
    
    // 2. MPT 토큰 조회
    console.log('\n   🪙 MPT tokens:');
    const mptObjects = await client.request({
      command: 'account_objects',
      account: founderAddress,
      type: 'mptoken'
    });
    
    if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
      mptObjects.result.account_objects.forEach((mpt: any, index: number) => {
        console.log(`      ${index + 1}. MPT Token:`);
        console.log(`         - Issuance ID: ${mpt.MPTokenIssuanceID}`);
        console.log(`         - Maximum Amount: ${mpt.MaximumAmount}`);
        console.log(`         - Asset Scale: ${mpt.AssetScale}`);
        console.log(`         - Transfer Fee: ${mpt.TransferFee}`);
        console.log(`         - Ledger Index: ${mpt.LedgerIndex}`);
      });
    } else {
      console.log('      No MPT tokens found');
    }
    
    // 3. 투자자 지갑들 정보
    console.log('\n   💰 Investor wallets status:');
    for (const address of investorAddresses) {
      try {
        const investorInfo = await client.request({
          command: 'account_info',
          account: address
        });
        console.log(`      - ${address}: ${investorInfo.result.account_data.Balance} drops`);
      } catch (error) {
        console.log(`      - ${address}: Account not found`);
      }
    }
    
    // 4. 최근 트랜잭션 조회
    console.log('\n   📜 Recent transactions:');
    const accountTx = await client.request({
      command: 'account_tx',
      account: founderAddress,
      limit: 5,
      binary: false
    });
    
    if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
      accountTx.result.transactions.forEach((tx: any, index: number) => {
        console.log(`      ${index + 1}. Transaction:`);
        console.log(`         - Hash: ${tx.tx_hash || 'N/A'}`);
        console.log(`         - Ledger: ${tx.ledger_index || 'N/A'}`);
        
        if (tx.tx) {
          console.log(`         - Type: ${tx.tx.TransactionType || 'N/A'}`);
          console.log(`         - Date: ${tx.tx.date ? new Date(tx.tx.date * 1000).toISOString() : 'N/A'}`);
          
          if (tx.tx.TransactionType === 'MPTokenIssuanceCreate') {
            console.log(`         - MPT Issuance ID: ${tx.tx.MPTokenIssuanceID || 'N/A'}`);
          }
        }
        
        if (tx.tx_hash) {
          const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.tx_hash}`;
          console.log(`         - Explorer: ${explorerUrl}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Error verifying transactions: ${error}`);
  }
}

// 실행
testFullStartupFlow().catch(console.error);
