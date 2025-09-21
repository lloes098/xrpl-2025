"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * 투자 처리 디버깅 테스트
 */
async function testInvestmentDebug() {
    const API_BASE = 'http://localhost:3001/api';
    console.log('🔍 Investment Debug Test');
    console.log('========================\n');
    try {
        // 1. 프로젝트 생성
        console.log('📝 Creating Project...');
        const projectData = {
            name: "Debug Test Project",
            description: "A project for debugging investment issues",
            targetAmount: 1000,
            deadline: "2025-12-31T23:59:59Z",
            creatorWallet: "rBHhLzGVehnrrb56DogDaVmMYbkRRRhwkf",
            website: "https://debugtest.com",
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
        // 2. 투자 시도 (상세한 오류 정보 확인)
        console.log('\n💰 Testing Investment...');
        const investmentData = {
            projectId: project.projectId,
            investorWallet: "rTestInvestor123456789",
            amount: 100,
            paymentMethod: "XRP",
            message: "Debug investment"
        };
        console.log('Investment data:', JSON.stringify(investmentData, null, 2));
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
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('   API Error:', error.response.data);
        }
    }
}
// 실행
testInvestmentDebug().catch(console.error);
//# sourceMappingURL=test-investment-debug.js.map