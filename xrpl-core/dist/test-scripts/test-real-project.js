"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
const axios_1 = __importDefault(require("axios"));
/**
 * 실제 창업 프로젝트 정보로 MPT 토큰 생성 테스트
 */
async function testRealProject() {
    console.log('🚀 Testing with real startup project data...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 1. 실제 창업 프로젝트 정보
        const realProjectData = {
            name: 'AI-Powered Healthcare Platform',
            description: 'Revolutionary AI system for early disease detection using machine learning algorithms to analyze medical images and patient data',
            targetAmount: 500000, // 500,000 XRP
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90일 후
            creatorWallet: '', // 동적으로 생성
            website: 'https://aihealthcare.com',
            logo: 'https://aihealthcare.com/logo.png',
            category: 'Healthcare',
            tags: ['AI', 'Healthcare', 'Machine Learning', 'Medical Technology'],
            socialLinks: {
                twitter: 'https://twitter.com/aihealthcare',
                linkedin: 'https://linkedin.com/company/aihealthcare',
                github: 'https://github.com/aihealthcare'
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
                    description: 'Complete minimum viable product with core AI algorithms',
                    targetAmount: 100000,
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    name: 'Clinical Trials',
                    description: 'Begin clinical trials with partner hospitals',
                    targetAmount: 200000,
                    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    name: 'FDA Approval',
                    description: 'Obtain FDA approval for medical device',
                    targetAmount: 200000,
                    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
        // 2. 창업자 지갑 생성 및 펀딩
        console.log('\n👤 Creating founder wallet...');
        const founderWallet = xrpl_1.Wallet.generate();
        console.log(`   - Founder Address: ${founderWallet.address}`);
        console.log(`   - Founder Seed: ${founderWallet.seed}`);
        // Devnet faucet으로 펀딩
        const fundResult = await client.fundWallet(founderWallet);
        console.log(`   - Funded: ${fundResult.balance} XRP`);
        // 3. API 호출로 프로젝트 생성
        console.log('\n🏗️ Creating project via API...');
        const projectData = {
            ...realProjectData,
            creatorWallet: founderWallet.address
        };
        const response = await axios_1.default.post('http://localhost:3001/api/projects', projectData);
        if (response.status === 201) {
            console.log('✅ Project created successfully!');
            console.log(`   - Project ID: ${response.data.projectId}`);
            console.log(`   - MPT ID: ${response.data.mptId}`);
            console.log(`   - Project Name: ${response.data.name}`);
            console.log(`   - Target Amount: ${response.data.targetAmount} XRP`);
            console.log(`   - Milestones: ${response.data.milestones.length}`);
            // 4. 생성된 프로젝트 상세 정보 조회
            console.log('\n📊 Project details:');
            const projectResponse = await axios_1.default.get(`http://localhost:3001/api/projects/${response.data.projectId}`);
            console.log(JSON.stringify(projectResponse.data, null, 2));
            // 5. XRPL Devnet Explorer 링크
            console.log('\n🌐 XRPL Devnet Explorer Links:');
            console.log(`   - Founder Wallet: https://devnet.xrpl.org/accounts/${founderWallet.address}`);
            console.log(`   - Platform Wallet: https://devnet.xrpl.org/accounts/rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi`);
        }
        else {
            console.log('❌ Project creation failed');
            console.log(response.data);
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await client.disconnect();
        console.log('\n🔌 Disconnected from Devnet');
    }
}
// 실행
testRealProject().catch(console.error);
//# sourceMappingURL=test-real-project.js.map