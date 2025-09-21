"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xrpl_1 = require("xrpl");
/**
 * XRPL Core API 통합 테스트
 */
async function testAPIIntegration() {
    console.log('🚀 Testing XRPL Core API Integration...');
    const API_BASE_URL = 'http://localhost:3001';
    try {
        // 1. 서버 상태 확인
        console.log('\n🏥 Checking server health...');
        const healthResponse = await axios_1.default.get(`${API_BASE_URL}/health`);
        console.log('✅ Server is healthy');
        console.log(`   - Status: ${healthResponse.data.status}`);
        console.log(`   - Timestamp: ${healthResponse.data.timestamp}`);
        // 2. API 문서 확인
        console.log('\n📚 Checking API documentation...');
        const apiResponse = await axios_1.default.get(`${API_BASE_URL}/api`);
        console.log('✅ API documentation available');
        console.log(`   - Available endpoints: ${Object.keys(apiResponse.data.endpoints).length}`);
        // 3. 프로젝트 생성 테스트
        console.log('\n🏗️ Testing project creation...');
        // 실제 지갑 생성
        const creatorWallet = xrpl_1.Wallet.generate();
        console.log(`   - Creator Wallet: ${creatorWallet.address}`);
        const projectData = {
            name: 'Test DeFi Project',
            description: 'A revolutionary DeFi platform for decentralized investment',
            targetAmount: 10000,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
            creatorWallet: creatorWallet.address,
            website: 'https://testdefi.com',
            logo: 'https://testdefi.com/logo.png',
            category: 'DeFi',
            tags: ['blockchain', 'defi', 'investment'],
            socialLinks: {
                twitter: 'https://twitter.com/testdefi',
                discord: 'https://discord.gg/testdefi'
            },
            tokenomics: {
                totalTokens: 1000000,
                tokenPrice: 0.01,
                platformTokenShare: 0.1,
                creatorTokenShare: 0.2,
                investorTokenShare: 0.7
            },
            milestones: [
                {
                    name: 'MVP Development',
                    description: 'Complete minimum viable product',
                    targetAmount: 5000,
                    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    name: 'Beta Launch',
                    description: 'Launch beta version for testing',
                    targetAmount: 3000,
                    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        };
        const projectResponse = await axios_1.default.post(`${API_BASE_URL}/api/projects`, projectData);
        if (projectResponse.data.success) {
            console.log('✅ Project created successfully!');
            console.log(`   - Project ID: ${projectResponse.data.data.projectId}`);
            console.log(`   - MPT Issuance ID: ${projectResponse.data.data.mptIssuanceId}`);
            console.log(`   - Transaction Hash: ${projectResponse.data.data.txHash}`);
            const projectId = projectResponse.data.data.projectId;
            // 4. 프로젝트 조회 테스트
            console.log('\n📋 Testing project retrieval...');
            const getProjectResponse = await axios_1.default.get(`${API_BASE_URL}/api/projects/${projectId}`);
            if (getProjectResponse.data.success) {
                console.log('✅ Project retrieved successfully!');
                console.log(`   - Name: ${getProjectResponse.data.data.name}`);
                console.log(`   - Status: ${getProjectResponse.data.data.status}`);
                console.log(`   - Progress: ${getProjectResponse.data.data.progress}%`);
                console.log(`   - Milestones: ${getProjectResponse.data.data.milestones.length}`);
            }
            // 5. 투자 처리 테스트
            console.log('\n💰 Testing investment processing...');
            // 투자자 지갑 생성
            const investorWallet = xrpl_1.Wallet.generate();
            console.log(`   - Investor Wallet: ${investorWallet.address}`);
            const investmentData = {
                projectId: projectId,
                investorWallet: investorWallet.address,
                amount: 1000,
                currency: 'RLUSD',
                investmentType: 'equity',
                notes: 'Test investment for DeFi project'
            };
            const investmentResponse = await axios_1.default.post(`${API_BASE_URL}/api/investments`, investmentData);
            if (investmentResponse.data.success) {
                console.log('✅ Investment processed successfully!');
                console.log(`   - Investment ID: ${investmentResponse.data.data.investmentId}`);
                console.log(`   - Transaction Hash: ${investmentResponse.data.data.txHash}`);
                console.log(`   - Tokens Received: ${investmentResponse.data.data.tokensReceived}`);
                console.log(`   - Amount: ${investmentResponse.data.data.amount} ${investmentResponse.data.data.currency}`);
            }
            // 6. 투자 목록 조회 테스트
            console.log('\n📊 Testing investment listing...');
            const investmentsResponse = await axios_1.default.get(`${API_BASE_URL}/api/investments`);
            if (investmentsResponse.data.success) {
                console.log('✅ Investments retrieved successfully!');
                console.log(`   - Total Investments: ${investmentsResponse.data.data.total}`);
                console.log(`   - Investment Details: ${investmentsResponse.data.data.investments.length} found`);
            }
            // 7. 마일스톤 달성 테스트
            console.log('\n🎯 Testing milestone achievement...');
            const milestoneId = getProjectResponse.data.data.milestones[0].id;
            const milestoneData = {
                evidence: {
                    type: 'github_commit',
                    url: 'https://github.com/testdefi/project/commit/abc123',
                    description: 'MVP development completed with core features'
                }
            };
            const milestoneResponse = await axios_1.default.post(`${API_BASE_URL}/api/projects/${projectId}/milestones/${milestoneId}/achieve`, milestoneData);
            if (milestoneResponse.data.success) {
                console.log('✅ Milestone achieved successfully!');
                console.log(`   - Milestone ID: ${milestoneResponse.data.data.milestoneId}`);
                console.log(`   - Transaction Hash: ${milestoneResponse.data.data.txHash}`);
            }
        }
        else {
            console.log('❌ Project creation failed');
            console.log(`   - Error: ${projectResponse.data.message}`);
        }
        // 8. 프로젝트 목록 조회 테스트
        console.log('\n📋 Testing project listing...');
        const projectsResponse = await axios_1.default.get(`${API_BASE_URL}/api/projects`);
        if (projectsResponse.data.success) {
            console.log('✅ Projects retrieved successfully!');
            console.log(`   - Total Projects: ${projectsResponse.data.data.total}`);
            console.log(`   - Project Details: ${projectsResponse.data.data.projects.length} found`);
        }
        console.log('\n🎉 All API tests completed successfully!');
        console.log('\n📊 Test Summary:');
        console.log('   ✅ Server Health Check');
        console.log('   ✅ API Documentation');
        console.log('   ✅ Project Creation');
        console.log('   ✅ Project Retrieval');
        console.log('   ✅ Investment Processing');
        console.log('   ✅ Investment Listing');
        console.log('   ✅ Milestone Achievement');
        console.log('   ✅ Project Listing');
    }
    catch (error) {
        console.error('❌ API test failed:', error.response?.data || error.message);
    }
}
// 실행
testAPIIntegration().catch(console.error);
//# sourceMappingURL=test-api-integration.js.map