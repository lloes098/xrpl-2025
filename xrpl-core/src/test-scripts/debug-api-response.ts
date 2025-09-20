import { Client, Wallet } from 'xrpl';
import axios from 'axios';

/**
 * API 응답 디버깅
 */
async function debugApiResponse() {
  console.log('🔍 Debugging API Response...');
  
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('✅ Connected to XRPL Devnet');
    
    // 1. 창업자 지갑 생성 및 펀딩
    console.log('\n👤 Creating founder wallet...');
    const founderWallet = Wallet.generate();
    console.log(`   - Founder Address: ${founderWallet.address}`);
    
    const fundResult = await client.fundWallet(founderWallet);
    console.log(`   - Funded: ${fundResult.balance} XRP`);
    
    // 2. 간단한 프로젝트 데이터
    const projectData = {
      name: 'AI Healthcare Platform',
      description: 'AI-powered medical diagnosis platform',
      targetAmount: 1000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      creatorWallet: founderWallet.address,
      website: 'https://aihealthcare.com',
      logo: 'https://aihealthcare.com/logo.png',
      category: 'Healthcare',
      tags: ['AI', 'Healthcare'],
      socialLinks: {
        twitter: 'https://twitter.com/aihealthcare'
      },
      tokenomics: {
        totalTokens: 1000000,
        tokenPrice: 0.001,
        platformTokenShare: 0.1,
        creatorTokenShare: 0.2,
        investorTokenShare: 0.7
      },
      milestones: [{
        name: 'MVP Development',
        description: 'Complete MVP with core features',
        targetAmount: 500,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      }]
    };
    
    // 3. 프로젝트 생성 API 호출
    console.log('\n🏗️ Creating project via API...');
    console.log('Request data:', JSON.stringify(projectData, null, 2));
    
    try {
      const response = await axios.post('http://localhost:3001/api/projects', projectData);
      console.log('\n✅ API Response:');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.projectId) {
        console.log('\n📊 Project Details:');
        console.log(`   - Project ID: ${response.data.projectId}`);
        console.log(`   - MPT ID: ${response.data.mptId}`);
        console.log(`   - Name: ${response.data.name}`);
        console.log(`   - Target Amount: ${response.data.targetAmount}`);
        console.log(`   - Milestones: ${response.data.milestones?.length || 0}`);
      }
      
    } catch (error: any) {
      console.log('\n❌ API Error:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.disconnect();
    console.log('\n🔌 Disconnected from Devnet');
  }
}

// 실행
debugApiResponse().catch(console.error);
