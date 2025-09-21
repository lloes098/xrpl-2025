"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * 프로젝트 일관성 테스트
 */
async function testProjectConsistency() {
    const API_BASE = 'http://localhost:3001/api';
    console.log('🔄 Project Consistency Test');
    console.log('===========================\n');
    try {
        // 1. 프로젝트 생성
        console.log('📝 Creating Project...');
        const projectData = {
            name: "Consistency Test Project",
            description: "Testing project consistency across APIs",
            targetAmount: 1000,
            deadline: "2025-12-31T23:59:59Z",
            creatorWallet: "rBHhLzGVehnrrb56DogDaVmMYbkRRRhwkf",
            website: "https://consistencytest.com",
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
        // 2. 프로젝트 목록 확인
        console.log('\n📋 Checking Project List...');
        try {
            const projectsResponse = await axios_1.default.get(`${API_BASE}/projects`);
            if (projectsResponse.data.success) {
                const projects = projectsResponse.data.data;
                console.log(`✅ Found ${projects.length} projects in list`);
                const foundProject = projects.find((p) => p.id === project.projectId);
                if (foundProject) {
                    console.log('✅ Project found in list:', foundProject.name);
                }
                else {
                    console.log('❌ Project NOT found in list');
                    console.log('Available projects:', projects.map((p) => p.id));
                }
            }
            else {
                console.log('❌ Project list retrieval failed:', projectsResponse.data.message);
            }
        }
        catch (error) {
            console.log('❌ Project list error:', error.message);
        }
        // 3. 개별 프로젝트 조회
        console.log('\n🔍 Checking Individual Project...');
        try {
            const projectResponse2 = await axios_1.default.get(`${API_BASE}/projects/${project.projectId}`);
            if (projectResponse2.data.success) {
                console.log('✅ Individual project retrieval successful');
                console.log('Project name:', projectResponse2.data.data.name);
            }
            else {
                console.log('❌ Individual project retrieval failed:', projectResponse2.data.message);
            }
        }
        catch (error) {
            console.log('❌ Individual project error:', error.message);
        }
        // 4. 투자 시도 (간단한 시드 사용)
        console.log('\n💰 Testing Investment with Simple Seed...');
        const investmentData = {
            projectId: project.projectId,
            investorWallet: "sEd7vWe7bM7gX92865hGokZssJmy757", // 유효한 시드
            amount: 50,
            paymentMethod: "XRP",
            message: "Consistency test investment"
        };
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
testProjectConsistency().catch(console.error);
//# sourceMappingURL=test-project-consistency.js.map