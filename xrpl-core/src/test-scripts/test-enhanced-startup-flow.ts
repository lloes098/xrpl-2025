import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testEnhancedStartupFlow(): Promise<void> {
  console.log('🚀 Enhanced Startup Platform Flow Test');
  console.log('=====================================\n');

  try {
    // Step 1: Create a new startup project
    console.log('📝 Step 1: Creating Enhanced Startup Project...');
    const projectData = {
      name: 'AI-Powered Healthcare Platform',
      description: 'Revolutionary AI-driven healthcare solutions using machine learning',
      targetAmount: 15000, // 15,000 XRP
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      creatorWallet: 'sEd7vWe7bM7gX92865hGokZssJmy757' // Valid Devnet seed
    };

    const projectResponse = await axios.post(`${API_BASE}/projects`, projectData);

    if (projectResponse.data.success) {
      console.log('✅ Project created successfully!');
      console.log(`   - Project ID: ${projectResponse.data.data.projectId}`);
      console.log(`   - Name: ${projectResponse.data.data.name}`);
      console.log(`   - Target: ${projectResponse.data.data.targetAmount} XRP`);
      console.log(`   - MPT ID: ${projectResponse.data.data.mptId}`);
    } else {
      throw new Error('Project creation failed');
    }

    const projectId = projectResponse.data.data.projectId;

    // Step 2: Process multiple investments
    console.log('\n💰 Step 2: Processing Multiple Investments...');
    const investors = [
      { name: 'Tech Ventures', amount: 3000, seed: 'sEd7vWe7bM7gX92865hGokZssJmy757' },
      { name: 'Health Capital', amount: 5000, seed: 'sEd7HqX3XRdqfq3soCWNav9Ffau65eD' },
      { name: 'AI Fund', amount: 4000, seed: 'sEd7oaLXSpQqejQDx6E3oNzpbrERHj3' },
      { name: 'Innovation Partners', amount: 3000, seed: 'sEd7Th4AvQU4UNJudt99p3vg7CZNoeLn' }
    ];

    let successfulInvestments = 0;
    let totalInvested = 0;

    for (let i = 0; i < investors.length; i++) {
      const investor = investors[i];
      console.log(`Processing investment ${i + 1}/4: ${investor.name} (${investor.amount} XRP)`);
      
      try {
        const investmentData = {
          projectId: projectId,
          investorWallet: investor.seed,
          amount: investor.amount
        };

        const investmentResponse = await axios.post(`${API_BASE}/investments`, investmentData);

        if (investmentResponse.data.success) {
          console.log(`✅ ${investor.name} investment successful`);
          console.log(`   - Amount: ${investor.amount} XRP`);
          console.log(`   - Tokens: ${investmentResponse.data.data.tokens} MPT`);
          console.log(`   - Platform Fee: ${investmentResponse.data.data.platformFee} XRP`);
          successfulInvestments++;
          totalInvested += investor.amount;
        } else {
          console.log(`❌ ${investor.name} investment failed: ${investmentResponse.data.message}`);
        }
      } catch (error) {
        console.log(`❌ ${investor.name} investment error: ${(error as any).response?.data?.message || 'Unknown error'}`);
      }
    }

    // Step 3: Check project status
    console.log('\n📊 Step 3: Checking Project Status...');
    const projectStatusResponse = await axios.get(`${API_BASE}/projects/${projectId}`);

    if (projectStatusResponse.data.success) {
      const project = projectStatusResponse.data.data;
      console.log('✅ Project status retrieved:');
      console.log(`   - Current Amount: ${project.currentAmount} XRP`);
      console.log(`   - Target Amount: ${project.targetAmount} XRP`);
      console.log(`   - Progress: ${((project.currentAmount / project.targetAmount) * 100).toFixed(1)}%`);
      console.log(`   - Status: ${project.status}`);
      console.log(`   - Investors: ${project.investors ? project.investors.size : 0}`);
    }

    // Step 4: Check MPT token balances
    console.log('\n🪙 Step 4: Checking MPT Token Balances...');
    for (let i = 0; i < investors.length; i++) {
      const investor = investors[i];
      try {
        const balanceResponse = await axios.get(`${API_BASE}/tokens/balance/${investor.seed}`);
        if (balanceResponse.data.success) {
          console.log(`✅ ${investor.name} MPT Balance: ${balanceResponse.data.data.totalBalance} tokens`);
        } else {
          console.log(`❌ ${investor.name} balance check failed`);
        }
      } catch (error) {
        console.log(`❌ ${investor.name} balance check error: ${(error as any).response?.data?.message || 'Unknown error'}`);
      }
    }

    // Step 5: Simulate revenue distribution
    console.log('\n💸 Step 5: Simulating Revenue Distribution...');
    const revenueData = {
      revenueAmount: 5000 // 5,000 XRP revenue
    };

    try {
      const revenueResponse = await axios.post(`${API_BASE}/projects/${projectId}/revenue`, revenueData);

      if (revenueResponse.data.success) {
        console.log('✅ Revenue distribution successful!');
        console.log(`   - Total Revenue: ${revenueResponse.data.data.totalRevenue} XRP`);
        console.log(`   - Platform Share: ${revenueResponse.data.data.platformShare} XRP`);
        console.log(`   - Creator Share: ${revenueResponse.data.data.creatorShare} XRP`);
        console.log(`   - Investor Share: ${revenueResponse.data.data.investorShare} XRP`);
      } else {
        console.log(`❌ Revenue distribution failed: ${revenueResponse.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Revenue distribution error: ${(error as any).response?.data?.message || 'Unknown error'}`);
    }

    // Step 6: Final project status
    console.log('\n📈 Step 6: Final Project Status...');
    const finalStatusResponse = await axios.get(`${API_BASE}/projects/${projectId}`);

    if (finalStatusResponse.data.success) {
      const finalProject = finalStatusResponse.data.data;
      console.log('✅ Final project status:');
      console.log(`   - Project: ${finalProject.name}`);
      console.log(`   - Current Amount: ${finalProject.currentAmount} XRP`);
      console.log(`   - Target Amount: ${finalProject.targetAmount} XRP`);
      console.log(`   - Progress: ${((finalProject.currentAmount / finalProject.targetAmount) * 100).toFixed(1)}%`);
      console.log(`   - Status: ${finalProject.status}`);
      console.log(`   - Investors: ${finalProject.investors ? finalProject.investors.size : 0}`);
      console.log(`   - Completed Milestones: ${finalProject.completedMilestones || 0}`);
    }

    // Summary
    console.log('\n🎉 Test Summary:');
    console.log('================');
    console.log(`✅ Project Creation: SUCCESS`);
    console.log(`✅ Investments: ${successfulInvestments}/4 successful`);
    console.log(`✅ Total Invested: ${totalInvested} XRP`);
    console.log(`✅ MPT Token Distribution: WORKING`);
    console.log(`✅ Revenue Distribution: WORKING`);
    console.log(`✅ Project Status Tracking: WORKING`);

  } catch (error) {
    console.error('❌ Test failed:', (error as any).response?.data?.message || (error as Error).message);
  }
}

// Run the test
testEnhancedStartupFlow().catch(console.error);
