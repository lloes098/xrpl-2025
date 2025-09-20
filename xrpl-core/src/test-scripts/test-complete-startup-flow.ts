import axios from 'axios';

/**
 * 완전한 스타트업 플랫폼 플로우 검증
 * 실제 프론트엔드 시뮬레이션
 */
async function testCompleteStartupFlow() {
  const API_BASE = 'http://localhost:3001/api';
  
  console.log('🚀 Complete Startup Platform Flow Test');
  console.log('=====================================\n');

  try {
    // 1. 프로젝트 생성 (창업자가 프로젝트 등록)
    console.log('📝 Step 1: Creating Startup Project...');
    const projectData = {
      name: "AI-Powered Healthcare Platform",
      description: "Revolutionary AI platform for personalized healthcare diagnostics and treatment recommendations",
      targetAmount: 5000, // 5000 XRP 목표
      deadline: "2025-12-31T23:59:59Z",
      creatorWallet: "rBHhLzGVehnrrb56DogDaVmMYbkRRRhwkf",
      website: "https://aihealthcare.com",
      logo: "https://aihealthcare.com/logo.png",
      category: "Healthcare Technology",
      tags: ["AI", "Healthcare", "Machine Learning", "Diagnostics"],
      socialLinks: {
        twitter: "https://twitter.com/aihealthcare",
        linkedin: "https://linkedin.com/company/aihealthcare",
        github: "https://github.com/aihealthcare"
      },
      tokenomics: {
        totalTokens: 10000000, // 1000만 토큰
        tokenPrice: 0.0005, // 토큰당 0.0005 XRP
        platformTokenShare: 0.1, // 플랫폼 10%
        creatorTokenShare: 0.2, // 창업자 20%
        investorTokenShare: 0.7  // 투자자 70%
      },
      milestones: [
        {
          name: "MVP Development",
          description: "Complete MVP with core AI diagnostic features",
          targetAmount: 2000,
          deadline: "2025-10-31T23:59:59Z"
        },
        {
          name: "Beta Testing",
          description: "Launch beta version with 1000 test users",
          targetAmount: 1500,
          deadline: "2025-11-30T23:59:59Z"
        },
        {
          name: "Market Launch",
          description: "Full market launch with marketing campaign",
          targetAmount: 1500,
          deadline: "2025-12-31T23:59:59Z"
        }
      ]
    };

    const projectResponse = await axios.post(`${API_BASE}/projects`, projectData);
    
    if (projectResponse.data.success) {
      const project = projectResponse.data.data;
      console.log('✅ Project created successfully!');
      console.log(`   - Project ID: ${project.projectId}`);
      console.log(`   - MPT Issuance ID: ${project.mptIssuanceId}`);
      console.log(`   - Transaction Hash: ${project.txHash}`);
      console.log(`   - Explorer: https://devnet.xrpl.org/objects/${project.mptIssuanceId}\n`);
    } else {
      throw new Error(`Project creation failed: ${projectResponse.data.message}`);
    }

    // 2. 투자자들 투자 처리 (여러 투자자가 동시에 투자)
    console.log('💰 Step 2: Processing Multiple Investments...');
    const investors = [
      { wallet: "sEd7vWe7bM7gX92865hGokZssJmy757", amount: 1000, name: "Alice Investor" },
      { wallet: "sEd7HqX3XRdqfq3soCWNav9Ffau65eD", amount: 1500, name: "Bob Capital" },
      { wallet: "sEd7oaLXSpQqejQDx6E3oNzpbrERHj3", amount: 800, name: "Charlie Ventures" },
      { wallet: "sEd7Th4AvQU4UNJudt99p3vg7CZNoeLn", amount: 1200, name: "Diana Fund" }
    ];

    const investmentPromises = investors.map(async (investor, index) => {
      console.log(`   Processing investment ${index + 1}/4: ${investor.name} (${investor.amount} XRP)`);
      
      const investmentData = {
        projectId: projectResponse.data.data.projectId,
        investorWallet: investor.wallet,
        amount: investor.amount,
        paymentMethod: "XRP",
        message: `Investment from ${investor.name}`
      };

      try {
        const investmentResponse = await axios.post(`${API_BASE}/investments`, investmentData);
        if (investmentResponse.data.success) {
          console.log(`   ✅ ${investor.name} investment successful`);
          return investmentResponse.data.data;
        } else {
          console.log(`   ❌ ${investor.name} investment failed: ${investmentResponse.data.message}`);
          return null;
        }
      } catch (error) {
        console.log(`   ❌ ${investor.name} investment error: ${(error as any).response?.data?.message || error.message}`);
        return null;
      }
    });

    const investmentResults = await Promise.all(investmentPromises);
    const successfulInvestments = investmentResults.filter(result => result !== null);
    console.log(`\n✅ ${successfulInvestments.length}/4 investments processed successfully\n`);

    // 3. 프로젝트 상태 확인
    console.log('📊 Step 3: Checking Project Status...');
    const projectStatusResponse = await axios.get(`${API_BASE}/projects/${projectResponse.data.data.projectId}`);
    
    if (projectStatusResponse.data.success) {
      const projectStatus = projectStatusResponse.data.data;
      console.log('✅ Project status retrieved:');
      console.log(`   - Current Amount: ${projectStatus.currentAmount} XRP`);
      console.log(`   - Target Amount: ${projectStatus.targetAmount} XRP`);
      console.log(`   - Progress: ${((projectStatus.currentAmount / projectStatus.targetAmount) * 100).toFixed(1)}%`);
      console.log(`   - Status: ${projectStatus.status}`);
      console.log(`   - Milestones: ${projectStatus.milestones.length}\n`);
    }

    // 4. 마일스톤 달성 (창업자가 마일스톤 완료 보고)
    console.log('🎯 Step 4: Achieving Milestones...');
    
    // 첫 번째 마일스톤 달성
    try {
      const milestone1Response = await axios.post(
        `${API_BASE}/projects/${projectResponse.data.data.projectId}/milestones/milestone_${projectResponse.data.data.projectId}_1/achieve`,
        {
          evidence: "https://github.com/aihealthcare/mvp-demo",
          description: "MVP completed with core AI diagnostic features"
        }
      );
      
      if (milestone1Response.data.success) {
        console.log('✅ Milestone 1 (MVP Development) achieved successfully!');
        console.log(`   - Released Amount: ${milestone1Response.data.data.releasedAmount} XRP`);
      } else {
        console.log('❌ Milestone 1 achievement failed:', milestone1Response.data.message);
      }
    } catch (error) {
      console.log('❌ Milestone 1 achievement error:', (error as any).response?.data?.message || error.message);
    }

    // 5. 투자자 MPT 토큰 확인
    console.log('\n🪙 Step 5: Checking Investor MPT Token Balances...');
    
    for (const investor of investors) {
      try {
        // 시드에서 주소 추출
        const { Wallet } = await import('xrpl');
        const wallet = Wallet.fromSeed(investor.wallet);
        const address = wallet.address;
        
        const balanceResponse = await axios.get(`${API_BASE}/tokens/balance/${address}`);
        if (balanceResponse.data.success) {
          console.log(`   ${investor.name}: ${balanceResponse.data.data.totalBalance} MPT tokens`);
        } else {
          console.log(`   ${investor.name}: Unable to retrieve balance`);
        }
      } catch (error) {
        console.log(`   ${investor.name}: Balance check failed`);
      }
    }

    // 6. 수익 분배 시뮬레이션 (프로젝트가 수익을 창출한 경우)
    console.log('\n💸 Step 6: Simulating Revenue Distribution...');
    
    try {
      const revenueData = {
        projectId: projectResponse.data.data.projectId,
        revenueAmount: 1000, // 1000 XRP 수익
        distributionMethod: "proportional" // 비례 분배
      };

      const revenueResponse = await axios.post(`${API_BASE}/projects/${projectResponse.data.data.projectId}/revenue`, revenueData);
      
      if (revenueResponse.data.success) {
        console.log('✅ Revenue distribution completed!');
        console.log(`   - Total Revenue: ${revenueResponse.data.data.totalRevenue} XRP`);
        console.log(`   - Platform Share: ${revenueResponse.data.data.platformShare} XRP`);
        console.log(`   - Creator Share: ${revenueResponse.data.data.creatorShare} XRP`);
        console.log(`   - Investor Share: ${revenueResponse.data.data.investorShare} XRP`);
      } else {
        console.log('❌ Revenue distribution failed:', revenueResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Revenue distribution error:', (error as any).response?.data?.message || error.message);
    }

    // 7. 최종 프로젝트 상태 확인
    console.log('\n📈 Step 7: Final Project Status...');
    const finalStatusResponse = await axios.get(`${API_BASE}/projects/${projectResponse.data.data.projectId}`);
    
    if (finalStatusResponse.data.success) {
      const finalStatus = finalStatusResponse.data.data;
      console.log('✅ Final project status:');
      console.log(`   - Project Name: ${finalStatus.name}`);
      console.log(`   - Current Amount: ${finalStatus.currentAmount} XRP`);
      console.log(`   - Target Amount: ${finalStatus.targetAmount} XRP`);
      console.log(`   - Status: ${finalStatus.status}`);
      console.log(`   - MPT Issuance ID: ${finalStatus.mptData.mptIssuanceId}`);
      console.log(`   - Total Investors: ${finalStatus.investors ? finalStatus.investors.size : 0}`);
      console.log(`   - Completed Milestones: ${finalStatus.milestones.filter((m: any) => m.status === 'COMPLETED').length}/${finalStatus.milestones.length}`);
    }

    console.log('\n🎉 Complete Startup Platform Flow Test Completed!');
    console.log('===============================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if ((error as any).response?.data) {
      console.error('   API Error:', (error as any).response.data);
    }
  }
}

// 실행
testCompleteStartupFlow().catch(console.error);
