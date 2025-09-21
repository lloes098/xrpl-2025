"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * 간단한 플로우 테스트 (단계별 검증)
 */
async function testSimpleFlow() {
    const API_BASE = 'http://localhost:3001/api';
    console.log('🧪 Simple Flow Test');
    console.log('==================\n');
    try {
        // 1. 프로젝트 생성
        console.log('📝 Step 1: Creating Project...');
        const projectData = {
            name: "Simple Test Project",
            description: "A simple test project for validation",
            targetAmount: 1000,
            deadline: "2025-12-31T23:59:59Z",
            creatorWallet: "rBHhLzGVehnrrb56DogDaVmMYbkRRRhwkf",
            website: "https://simpletest.com",
            category: "Technology",
            tokenomics: {
                totalTokens: 1000000,
                tokenPrice: 0.001,
                platformTokenShare: 0.1,
                creatorTokenShare: 0.2,
                investorTokenShare: 0.7
            },
            milestones: [
                {
                    name: "Test Milestone",
                    description: "A test milestone",
                    targetAmount: 500,
                    deadline: "2025-11-30T23:59:59Z"
                }
            ]
        };
        const projectResponse = await axios_1.default.post(`${API_BASE}/projects`, projectData);
        if (projectResponse.data.success) {
            const project = projectResponse.data.data;
            console.log('✅ Project created successfully!');
            console.log(`   - Project ID: ${project.projectId}`);
            console.log(`   - MPT Issuance ID: ${project.mptIssuanceId}`);
            console.log(`   - Explorer: https://devnet.xrpl.org/objects/${project.mptIssuanceId}\n`);
            // 2. 프로젝트 조회
            console.log('📊 Step 2: Retrieving Project...');
            const getProjectResponse = await axios_1.default.get(`${API_BASE}/projects/${project.projectId}`);
            if (getProjectResponse.data.success) {
                const projectDetails = getProjectResponse.data.data;
                console.log('✅ Project retrieved successfully!');
                console.log(`   - Name: ${projectDetails.name}`);
                console.log(`   - Status: ${projectDetails.status}`);
                console.log(`   - Target Amount: ${projectDetails.targetAmount} XRP`);
                console.log(`   - Current Amount: ${projectDetails.currentAmount} XRP`);
                console.log(`   - Milestones: ${projectDetails.milestones.length}\n`);
            }
            else {
                console.log('❌ Project retrieval failed:', getProjectResponse.data.message);
            }
            // 3. 투자 시도 (간단한 투자)
            console.log('💰 Step 3: Testing Investment...');
            const investmentData = {
                projectId: project.projectId,
                investorWallet: "rTestInvestor123456789",
                amount: 100,
                paymentMethod: "XRP",
                message: "Test investment"
            };
            try {
                const investmentResponse = await axios_1.default.post(`${API_BASE}/investments`, investmentData);
                console.log('Investment response:', investmentResponse.data);
            }
            catch (error) {
                console.log('❌ Investment failed:', error.response?.data?.message || error.message);
            }
            // 4. 마일스톤 달성 시도
            console.log('\n🎯 Step 4: Testing Milestone Achievement...');
            try {
                const milestoneResponse = await axios_1.default.post(`${API_BASE}/projects/${project.projectId}/milestones/milestone_${project.projectId}_1/achieve`, {
                    evidence: "https://github.com/test/evidence",
                    description: "Test milestone completion"
                });
                console.log('Milestone response:', milestoneResponse.data);
            }
            catch (error) {
                console.log('❌ Milestone achievement failed:', error.response?.data?.message || error.message);
            }
            // 5. 프로젝트 목록 조회
            console.log('\n📋 Step 5: Testing Project List...');
            try {
                const projectsResponse = await axios_1.default.get(`${API_BASE}/projects`);
                if (projectsResponse.data.success) {
                    console.log(`✅ Retrieved ${projectsResponse.data.data.length} projects`);
                }
                else {
                    console.log('❌ Project list retrieval failed:', projectsResponse.data.message);
                }
            }
            catch (error) {
                console.log('❌ Project list failed:', error.response?.data?.message || error.message);
            }
        }
        else {
            console.log('❌ Project creation failed:', projectResponse.data.message);
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
testSimpleFlow().catch(console.error);
//# sourceMappingURL=test-simple-flow.js.map