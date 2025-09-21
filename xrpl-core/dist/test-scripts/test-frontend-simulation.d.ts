/**
 * 프론트엔드 시뮬레이션 테스트 스크립트
 * 실제 XRPL 트랜잭션을 테스트할 수 있는 시나리오들
 */
declare class FrontendSimulationTester {
    private testResults;
    /**
     * 모든 테스트 시나리오 실행
     */
    runAllTests(): Promise<void>;
    /**
     * 프로젝트 생성 테스트
     */
    private testProjectCreation;
    /**
     * 투자 처리 테스트
     */
    private testInvestmentProcessing;
    /**
     * 마일스톤 달성 테스트
     */
    private testMilestoneAchievement;
    /**
     * 프로젝트 조회 테스트
     */
    private testProjectRetrieval;
    /**
     * 투자 조회 테스트
     */
    private testInvestmentRetrieval;
    /**
     * 테스트 결과 출력
     */
    private printTestResults;
}
export default FrontendSimulationTester;
//# sourceMappingURL=test-frontend-simulation.d.ts.map