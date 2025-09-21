"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xrpl_1 = require("xrpl");
/**
 * 간단한 API 테스트 (Devnet에서 실제 지갑 생성 및 펀딩)
 */
async function testSimpleAPI() {
    console.log('🚀 Testing Simple API with Real Devnet Wallets...');
    const API_BASE_URL = 'http://localhost:3001';
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        // 1. Devnet 연결 및 실제 지갑 생성
        await client.connect();
        console.log('✅ Connected to Devnet');
        const creatorWallet = xrpl_1.Wallet.generate();
        console.log(`   - Creator Wallet: ${creatorWallet.address}`);
        // 2. Devnet faucet으로 펀딩
        console.log('\n💧 Funding creator wallet...');
        const fundResult = await client.fundWallet(creatorWallet);
        console.log(`   - Funded: ${fundResult.balance} XRP`);
        // 3. 서버 상태 확인
        console.log('\n🏥 Checking server health...');
        await axios_1.default.get(`${API_BASE_URL}/health`);
        console.log('✅ Server is healthy');
        // 4. 프로젝트 생성 테스트 (실제 펀딩된 지갑 사용)
        console.log('\n🏗️ Testing project creation with real wallet...');
        const projectData = {
            name: 'Real Devnet Test Project',
            description: 'A project created with real Devnet wallet',
            targetAmount: 1000,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            creatorWallet: creatorWallet.address,
            website: 'https://testproject.com',
            category: 'Technology',
            tags: ['blockchain', 'test'],
            tokenomics: {
                totalTokens: 100000,
                tokenPrice: 0.01,
                platformTokenShare: 0.1,
                creatorTokenShare: 0.2,
                investorTokenShare: 0.7
            },
            milestones: [
                {
                    name: 'Development Phase',
                    description: 'Core development',
                    targetAmount: 500,
                    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
        const projectResponse = await axios_1.default.post(`${API_BASE_URL}/api/projects`, projectData);
        if (projectResponse.data.success) {
            console.log('✅ Project created successfully!');
            console.log(`   - Project ID: ${projectResponse.data.data.projectId}`);
            console.log(`   - MPT Issuance ID: ${projectResponse.data.data.mptIssuanceId}`);
            console.log(`   - Transaction Hash: ${projectResponse.data.data.txHash}`);
            // 5. 프로젝트 조회 테스트
            console.log('\n📋 Testing project retrieval...');
            const getProjectResponse = await axios_1.default.get(`${API_BASE_URL}/api/projects/${projectResponse.data.data.projectId}`);
            if (getProjectResponse.data.success) {
                console.log('✅ Project retrieved successfully!');
                console.log(`   - Name: ${getProjectResponse.data.data.name}`);
                console.log(`   - Status: ${getProjectResponse.data.data.status}`);
                console.log(`   - Progress: ${getProjectResponse.data.data.progress}%`);
            }
            // 6. 투자자 지갑 생성 및 투자 테스트
            console.log('\n💰 Testing investment with real wallet...');
            const investorWallet = xrpl_1.Wallet.generate();
            console.log(`   - Investor Wallet: ${investorWallet.address}`);
            // 투자자 지갑 펀딩
            const investorFundResult = await client.fundWallet(investorWallet);
            console.log(`   - Investor Funded: ${investorFundResult.balance} XRP`);
            const investmentData = {
                projectId: projectResponse.data.data.projectId,
                investorWallet: investorWallet.address,
                amount: 100,
                currency: 'RLUSD',
                investmentType: 'equity',
                notes: 'Test investment with real Devnet wallet'
            };
            const investmentResponse = await axios_1.default.post(`${API_BASE_URL}/api/investments`, investmentData);
            if (investmentResponse.data.success) {
                console.log('✅ Investment processed successfully!');
                console.log(`   - Investment ID: ${investmentResponse.data.data.investmentId}`);
                console.log(`   - Transaction Hash: ${investmentResponse.data.data.txHash}`);
                console.log(`   - Tokens Received: ${investmentResponse.data.data.tokensReceived}`);
            }
            else {
                console.log('❌ Investment failed:', investmentResponse.data.message);
            }
        }
        else {
            console.log('❌ Project creation failed:', projectResponse.data.message);
        }
        console.log('\n🎉 Simple API test completed!');
    }
    catch (error) {
        console.error('❌ Simple API test failed:', error.response?.data || error.message);
    }
    finally {
        await client.disconnect();
        console.log('🔌 Disconnected from Devnet');
    }
}
// 실행
testSimpleAPI().catch(console.error);
//# sourceMappingURL=test-simple-api.js.map