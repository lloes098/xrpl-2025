"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const frontend_simulation_json_1 = __importDefault(require("../test-data/frontend-simulation.json"));
const API_BASE_URL = 'http://localhost:3001/api';
/**
 * 프론트엔드 시뮬레이션 테스트 스크립트
 * 실제 XRPL 트랜잭션을 테스트할 수 있는 시나리오들
 */
class FrontendSimulationTester {
    constructor() {
        this.testResults = [];
    }
    /**
     * 모든 테스트 시나리오 실행
     */
    async runAllTests() {
        console.log('🚀 Starting Frontend Simulation Tests...\n');
        try {
            // 1. 프로젝트 생성 테스트
            await this.testProjectCreation();
            // 2. 투자 처리 테스트
            await this.testInvestmentProcessing();
            // 3. 마일스톤 달성 테스트
            await this.testMilestoneAchievement();
            // 4. 프로젝트 조회 테스트
            await this.testProjectRetrieval();
            // 5. 투자 조회 테스트
            await this.testInvestmentRetrieval();
            // 결과 출력
            this.printTestResults();
        }
        catch (error) {
            console.error('❌ Test execution failed:', error);
        }
    }
    /**
     * 프로젝트 생성 테스트
     */
    async testProjectCreation() {
        console.log('📝 Testing Project Creation...');
        const scenarios = frontend_simulation_json_1.default.testScenarios.projectCreation;
        for (const [scenarioName, scenario] of Object.entries(scenarios)) {
            try {
                console.log(`   - ${scenario.description}`);
                const response = await axios_1.default.post(`${API_BASE_URL}/projects`, scenario.request.body, {
                    headers: scenario.request.headers,
                    timeout: 30000
                });
                if (response.data.success) {
                    this.testResults.push({
                        scenario: `Project Creation - ${scenarioName}`,
                        success: true,
                        message: 'Project created successfully',
                        data: response.data.data
                    });
                    console.log(`   ✅ Success: ${response.data.data.projectId}`);
                }
                else {
                    this.testResults.push({
                        scenario: `Project Creation - ${scenarioName}`,
                        success: false,
                        message: response.data.message || 'Project creation failed'
                    });
                    console.log(`   ❌ Failed: ${response.data.message}`);
                }
            }
            catch (error) {
                this.testResults.push({
                    scenario: `Project Creation - ${scenarioName}`,
                    success: false,
                    message: 'Request failed',
                    error: error.message
                });
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        console.log('');
    }
    /**
     * 투자 처리 테스트
     */
    async testInvestmentProcessing() {
        console.log('💰 Testing Investment Processing...');
        const scenarios = frontend_simulation_json_1.default.testScenarios.investment;
        for (const [scenarioName, scenario] of Object.entries(scenarios)) {
            try {
                console.log(`   - ${scenario.description}`);
                // 테스트용 투자자 지갑 시드 사용
                const testWallet = frontend_simulation_json_1.default.testWallets.investors[0];
                if (!testWallet) {
                    console.error('❌ No test wallet available');
                    continue;
                }
                const requestBody = {
                    ...scenario.request.body,
                    investorWallet: testWallet.seed
                };
                const response = await axios_1.default.post(`${API_BASE_URL}/investments`, requestBody, {
                    headers: scenario.request.headers,
                    timeout: 30000
                });
                if (response.data.success) {
                    this.testResults.push({
                        scenario: `Investment - ${scenarioName}`,
                        success: true,
                        message: 'Investment processed successfully',
                        data: response.data.data
                    });
                    console.log(`   ✅ Success: ${response.data.data.investmentId}`);
                }
                else {
                    this.testResults.push({
                        scenario: `Investment - ${scenarioName}`,
                        success: false,
                        message: response.data.message || 'Investment processing failed'
                    });
                    console.log(`   ❌ Failed: ${response.data.message}`);
                }
            }
            catch (error) {
                this.testResults.push({
                    scenario: `Investment - ${scenarioName}`,
                    success: false,
                    message: 'Request failed',
                    error: error.message
                });
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        console.log('');
    }
    /**
     * 마일스톤 달성 테스트
     */
    async testMilestoneAchievement() {
        console.log('🎯 Testing Milestone Achievement...');
        const scenarios = frontend_simulation_json_1.default.testScenarios.milestoneAchievement;
        for (const [scenarioName, scenario] of Object.entries(scenarios)) {
            try {
                console.log(`   - ${scenario.description}`);
                const response = await axios_1.default.post(`${API_BASE_URL}/projects/${scenario.request.body.projectId}/milestones/${scenario.request.body.milestoneId}/achieve`, { evidence: scenario.request.body.evidence }, {
                    headers: scenario.request.headers,
                    timeout: 30000
                });
                if (response.data.success) {
                    this.testResults.push({
                        scenario: `Milestone Achievement - ${scenarioName}`,
                        success: true,
                        message: 'Milestone achieved successfully',
                        data: response.data.data
                    });
                    console.log(`   ✅ Success: ${response.data.data.milestoneId}`);
                }
                else {
                    this.testResults.push({
                        scenario: `Milestone Achievement - ${scenarioName}`,
                        success: false,
                        message: response.data.message || 'Milestone achievement failed'
                    });
                    console.log(`   ❌ Failed: ${response.data.message}`);
                }
            }
            catch (error) {
                this.testResults.push({
                    scenario: `Milestone Achievement - ${scenarioName}`,
                    success: false,
                    message: 'Request failed',
                    error: error.message
                });
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        console.log('');
    }
    /**
     * 프로젝트 조회 테스트
     */
    async testProjectRetrieval() {
        console.log('📋 Testing Project Retrieval...');
        try {
            // 프로젝트 목록 조회
            const listResponse = await axios_1.default.get(`${API_BASE_URL}/projects`);
            if (listResponse.data.success) {
                this.testResults.push({
                    scenario: 'Project List Retrieval',
                    success: true,
                    message: 'Project list retrieved successfully',
                    data: {
                        total: listResponse.data.data.total,
                        active: listResponse.data.data.active
                    }
                });
                console.log(`   ✅ Project List: ${listResponse.data.data.total} total, ${listResponse.data.data.active} active`);
                // 첫 번째 프로젝트 상세 조회
                if (listResponse.data.data.projects.length > 0) {
                    const firstProject = listResponse.data.data.projects[0];
                    const detailResponse = await axios_1.default.get(`${API_BASE_URL}/projects/${firstProject.id}`);
                    if (detailResponse.data.success) {
                        this.testResults.push({
                            scenario: 'Project Detail Retrieval',
                            success: true,
                            message: 'Project detail retrieved successfully',
                            data: {
                                projectId: detailResponse.data.data.id,
                                name: detailResponse.data.data.name
                            }
                        });
                        console.log(`   ✅ Project Detail: ${detailResponse.data.data.name}`);
                    }
                }
            }
        }
        catch (error) {
            this.testResults.push({
                scenario: 'Project Retrieval',
                success: false,
                message: 'Request failed',
                error: error.message
            });
            console.log(`   ❌ Error: ${error.message}`);
        }
        console.log('');
    }
    /**
     * 투자 조회 테스트
     */
    async testInvestmentRetrieval() {
        console.log('💼 Testing Investment Retrieval...');
        try {
            // 투자 목록 조회
            const listResponse = await axios_1.default.get(`${API_BASE_URL}/investments`);
            if (listResponse.data.success) {
                this.testResults.push({
                    scenario: 'Investment List Retrieval',
                    success: true,
                    message: 'Investment list retrieved successfully',
                    data: {
                        total: listResponse.data.data.total
                    }
                });
                console.log(`   ✅ Investment List: ${listResponse.data.data.total} total`);
                // 첫 번째 투자 상세 조회
                if (listResponse.data.data.investments.length > 0) {
                    const firstInvestment = listResponse.data.data.investments[0];
                    const detailResponse = await axios_1.default.get(`${API_BASE_URL}/investments/${firstInvestment.id}`);
                    if (detailResponse.data.success) {
                        this.testResults.push({
                            scenario: 'Investment Detail Retrieval',
                            success: true,
                            message: 'Investment detail retrieved successfully',
                            data: {
                                investmentId: detailResponse.data.data.id,
                                amount: detailResponse.data.data.amount
                            }
                        });
                        console.log(`   ✅ Investment Detail: ${detailResponse.data.data.amount} XRP`);
                    }
                }
            }
        }
        catch (error) {
            this.testResults.push({
                scenario: 'Investment Retrieval',
                success: false,
                message: 'Request failed',
                error: error.message
            });
            console.log(`   ❌ Error: ${error.message}`);
        }
        console.log('');
    }
    /**
     * 테스트 결과 출력
     */
    printTestResults() {
        console.log('📊 Test Results Summary');
        console.log('='.repeat(50));
        const successful = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;
        const total = this.testResults.length;
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${Math.round((successful / total) * 100)}%\n`);
        // 실패한 테스트 상세 정보
        const failedTests = this.testResults.filter(r => !r.success);
        if (failedTests.length > 0) {
            console.log('❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`   - ${test.scenario}: ${test.message}`);
                if (test.error) {
                    console.log(`     Error: ${test.error}`);
                }
            });
        }
        // 성공한 테스트 상세 정보
        const successfulTests = this.testResults.filter(r => r.success);
        if (successfulTests.length > 0) {
            console.log('\n✅ Successful Tests:');
            successfulTests.forEach(test => {
                console.log(`   - ${test.scenario}: ${test.message}`);
                if (test.data) {
                    console.log(`     Data: ${JSON.stringify(test.data, null, 2)}`);
                }
            });
        }
    }
}
// 테스트 실행
async function main() {
    const tester = new FrontendSimulationTester();
    await tester.runAllTests();
}
// 스크립트가 직접 실행된 경우에만 테스트 실행
if (require.main === module) {
    main().catch(console.error);
}
exports.default = FrontendSimulationTester;
//# sourceMappingURL=test-frontend-simulation.js.map