"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xrpl_1 = require("xrpl");
/**
 * 유효한 투자 처리 테스트
 */
async function testValidInvestment() {
    const API_BASE = 'http://localhost:3001/api';
    console.log('💰 Valid Investment Test');
    console.log('========================\n');
    try {
        // 1. 프로젝트 생성
        console.log('📝 Creating Project...');
        const projectData = {
            name: "Valid Investment Test Project",
            description: "A project for testing valid investments",
            targetAmount: 1000,
            deadline: "2025-12-31T23:59:59Z",
            creatorWallet: "rBHhLzGVehnrrb56DogDaVmMYbkRRRhwkf",
            website: "https://validtest.com",
            category: "Technology",
            tokenomics: {
                totalTokens: 1000000,
                tokenPrice: 0.001,
                platformTokenShare: 0.1,
                creatorTokenShare: 0.2,
                investorTokenShare: 0.7
            },
            milestones: []
        };
        const projectResponse = await axios_1.default.post(`${API_BASE}/projects`, projectData);
        if (!projectResponse.data.success) {
            console.log('❌ Project creation failed:', projectResponse.data.message);
            return;
        }
        const project = projectResponse.data.data;
        console.log('✅ Project created:', project.projectId);
        // 2. 유효한 투자자 지갑 생성
        console.log('\n👤 Creating Valid Investor Wallet...');
        const investorWallet = xrpl_1.Wallet.generate();
        console.log('Investor wallet created:');
        console.log('  - Address:', investorWallet.address);
        console.log('  - Seed:', investorWallet.seed);
        // 3. 투자 시도
        console.log('\n💰 Testing Investment...');
        const investmentData = {
            projectId: project.projectId,
            investorWallet: investorWallet.seed, // 시드 사용
            amount: 100,
            paymentMethod: "XRP",
            message: "Valid investment test"
        };
        console.log('Investment data:', JSON.stringify({
            ...investmentData,
            investorWallet: investorWallet.address // 로그에서는 주소만 표시
        }, null, 2));
        try {
            const investmentResponse = await axios_1.default.post(`${API_BASE}/investments`, investmentData);
            console.log('✅ Investment successful!');
            console.log('Response:', JSON.stringify(investmentResponse.data, null, 2));
        }
        catch (error) {
            console.log('❌ Investment failed:');
            console.log('Error message:', error.message);
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        // 4. 프로젝트 상태 확인
        console.log('\n📊 Checking Project Status...');
        try {
            const projectStatusResponse = await axios_1.default.get(`${API_BASE}/projects/${project.projectId}`);
            if (projectStatusResponse.data.success) {
                const projectStatus = projectStatusResponse.data.data;
                console.log('✅ Project status:');
                console.log(`  - Current Amount: ${projectStatus.currentAmount} XRP`);
                console.log(`  - Target Amount: ${projectStatus.targetAmount} XRP`);
                console.log(`  - Status: ${projectStatus.status}`);
            }
        }
        catch (error) {
            console.log('❌ Project status check failed:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('   API Error:', error.response.data);
        }
    }
}
// 실행
testValidInvestment().catch(console.error);
//# sourceMappingURL=test-valid-investment.js.map