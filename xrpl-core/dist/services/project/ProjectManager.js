"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
const constants_1 = require("../../config/constants");
/**
 * 프로젝트 관리 서비스
 * 프로젝트 생성, 투자 처리, 마일스톤 관리
 */
class ProjectManager {
    constructor(_xrplClient, mptManager, escrowManager, batchManager, walletManager) {
        this.projects = new Map();
        this.investments = new Map();
        // this._client = xrplClient; // 사용하지 않음
        this.mptManager = mptManager;
        this.escrowManager = escrowManager;
        this.batchManager = batchManager;
        this.walletManager = walletManager;
    }
    /**
     * 새 프로젝트 생성
     * @param projectData - 프로젝트 데이터
     * @returns 프로젝트 생성 결과
     */
    async createProject(projectData) {
        try {
            const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // 1. 프로젝트용 MPT 토큰 생성
            const mptData = await this.mptManager.createProjectMPT({
                projectId,
                name: projectData.name,
                description: projectData.description,
                totalTokens: projectData.tokenomics.totalTokens,
                targetAmount: projectData.targetAmount,
                ...(projectData.website && { website: projectData.website }),
                ...(projectData.logo && { logo: projectData.logo }),
                ...(projectData.category && { category: projectData.category }),
                ...(projectData.tags && { tags: projectData.tags }),
                ...(projectData.socialLinks && { socialLinks: projectData.socialLinks })
            });
            // 2. 마일스톤 데이터 생성
            const milestones = projectData.milestones.map((milestone, index) => ({
                id: `milestone_${projectId}_${index + 1}`,
                projectId,
                name: milestone.name,
                description: milestone.description,
                targetAmount: milestone.targetAmount,
                status: constants_1.MILESTONE_STATUS['PENDING'],
                deadline: milestone.deadline,
                evidence: milestone.evidence,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            // 3. 프로젝트 데이터 생성
            const project = {
                id: projectId,
                name: projectData.name,
                description: projectData.description,
                targetAmount: projectData.targetAmount,
                currentAmount: 0,
                deadline: projectData.deadline,
                creatorWallet: projectData.creatorWallet,
                mptData,
                milestones,
                investors: new Map(),
                status: constants_1.PROJECT_STATUS['ACTIVE'],
                website: projectData.website || '',
                logo: projectData.logo || '',
                category: projectData.category || '',
                tags: projectData.tags || [],
                socialLinks: projectData.socialLinks || {},
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // 4. 프로젝트 저장
            this.projects.set(projectId, project);
            console.log(`✅ Project created: ${projectId}`);
            console.log(`   - Name: ${projectData.name}`);
            console.log(`   - Target: ${projectData.targetAmount} XRP`);
            console.log(`   - MPT ID: ${mptData.mptIssuanceId}`);
            console.log(`   - Milestones: ${milestones.length}`);
            return {
                success: true,
                projectId,
                mptIssuanceId: mptData.mptIssuanceId,
                txHash: 'project_creation_tx_hash', // MPT 생성 트랜잭션 해시
                message: 'Project created successfully'
            };
        }
        catch (error) {
            console.error('❌ Project creation failed:', error);
            return {
                success: false,
                message: `Project creation failed: ${error.message}`
            };
        }
    }
    /**
     * 프로젝트에 투자 처리
     * @param investmentRequest - 투자 요청
     * @returns 투자 처리 결과
     */
    async processInvestment(investmentRequest) {
        try {
            const project = this.projects.get(investmentRequest.projectId);
            if (!project) {
                throw new Error(`Project not found: ${investmentRequest.projectId}`);
            }
            if (project.status !== constants_1.PROJECT_STATUS['ACTIVE']) {
                throw new Error(`Project is not active: ${project.status}`);
            }
            // 1. 투자 금액 검증
            const investmentAmount = investmentRequest.xrpAmount || investmentRequest.rlusdAmount || 0;
            if (investmentAmount <= 0) {
                throw new Error('Invalid investment amount');
            }
            // 2. 수수료 계산
            const platformFee = investmentAmount * 0.05; // 5% 플랫폼 수수료
            const netInvestment = investmentAmount - platformFee;
            // 3. 토큰 할당 계산
            const tokenPrice = project.mptData ? this.calculateTokenPrice(project) : 0.1;
            const tokensToReceive = Math.floor(netInvestment / tokenPrice);
            // 4. 간단한 투자 처리 (배치 트랜잭션 대신 직접 처리)
            // TODO: 실제 XRPL 트랜잭션으로 교체 필요
            console.log(`Processing investment: ${netInvestment} XRP to project ${investmentRequest.projectId}`);
            console.log(`Platform fee: ${platformFee} XRP`);
            console.log(`Tokens to receive: ${tokensToReceive}`);
            // 임시로 성공으로 처리 (실제 트랜잭션은 나중에 구현)
            const batchResult = {
                success: true,
                batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                txHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                innerTransactions: []
            };
            // 5. 투자 데이터 생성
            const investmentId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const investment = {
                id: investmentId,
                projectId: investmentRequest.projectId,
                investorAddress: investmentRequest.investorWallet.address,
                amount: investmentAmount,
                tokens: tokensToReceive,
                rlusdAmount: investmentAmount,
                tokenAmount: tokensToReceive,
                investmentType: 'equity',
                riskLevel: 'medium',
                status: constants_1.INVESTMENT_STATUS['CONFIRMED'],
                txHash: batchResult.txHash || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // 6. 투자 데이터 저장
            this.investments.set(investmentId, investment);
            project.investors.set(investmentId, investment);
            project.currentAmount += investmentAmount;
            // 7. 프로젝트 상태 업데이트
            if (project.currentAmount >= project.targetAmount) {
                project.status = constants_1.PROJECT_STATUS['FUNDED'];
            }
            project.updatedAt = new Date();
            this.projects.set(investmentRequest.projectId, project);
            // 8. 에스크로 생성 (조건부 자금 보관)
            await this.escrowManager.createInvestmentEscrow({
                id: `escrow_${investmentId}`,
                projectId: investmentRequest.projectId,
                investorAddress: investmentRequest.investorWallet.address,
                mptIssuanceId: project.mptData?.mptIssuanceId || '',
                tokenAmount: tokensToReceive,
                rlusdAmount: netInvestment,
                deadline: project.deadline,
                conditionType: 'milestone',
                milestoneId: project.milestones[0]?.id || '',
                projectWallet: project.creatorWallet,
                investorSeed: investmentRequest.investorWallet.privateKey,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Investment processed: ${investmentId}`);
            console.log(`   - Project: ${project.name}`);
            console.log(`   - Amount: ${investmentRequest.rlusdAmount} XRP`);
            console.log(`   - Tokens: ${tokensToReceive} MPT`);
            console.log(`   - Platform Fee: ${platformFee} XRP`);
            console.log(`   - Batch Hash: ${batchResult.txHash}`);
            return {
                success: true,
                investmentId,
                txHash: batchResult.txHash || '',
                tokensReceived: tokensToReceive,
                message: 'Investment processed successfully'
            };
        }
        catch (error) {
            console.error('❌ Investment processing failed:', error);
            return {
                success: false,
                message: `Investment processing failed: ${error.message}`
            };
        }
    }
    /**
     * 마일스톤 달성 처리
     * @param projectId - 프로젝트 ID
     * @param milestoneId - 마일스톤 ID
     * @param evidence - 달성 증거
     * @returns 마일스톤 달성 결과
     */
    async achieveMilestone(projectId, milestoneId, evidence) {
        try {
            const project = this.projects.get(projectId);
            if (!project) {
                throw new Error(`Project not found: ${projectId}`);
            }
            const milestone = project.milestones.find(m => m.id === milestoneId);
            if (!milestone) {
                throw new Error(`Milestone not found: ${milestoneId}`);
            }
            if (milestone.status !== constants_1.MILESTONE_STATUS['PENDING']) {
                throw new Error(`Milestone already processed: ${milestone.status}`);
            }
            // 1. 마일스톤 검증 (실제 구현에서는 더 정교한 검증 필요)
            const isValidMilestone = await this.verifyMilestoneEvidence(milestone, evidence);
            if (!isValidMilestone) {
                throw new Error('Milestone verification failed');
            }
            // 2. 마일스톤 상태 업데이트
            milestone.status = constants_1.MILESTONE_STATUS['COMPLETED'];
            milestone.achievedAt = new Date();
            milestone.updatedAt = new Date();
            // 3. 관련 에스크로 해제
            const projectEscrows = this.escrowManager.getEscrowsByProject(projectId);
            let releaseTxHash = '';
            for (const escrow of projectEscrows) {
                if (escrow.milestoneId === milestoneId) {
                    const releaseResult = await this.escrowManager.releaseEscrow(escrow.id, evidence);
                    if (releaseResult.success) {
                        releaseTxHash = releaseResult.txHash || '';
                        console.log(`✅ Escrow released for milestone: ${milestoneId}`);
                    }
                }
            }
            // 4. 프로젝트 상태 확인
            const completedMilestones = project.milestones.filter(m => m.status === constants_1.MILESTONE_STATUS['COMPLETED']);
            if (completedMilestones.length === project.milestones.length) {
                project.status = constants_1.PROJECT_STATUS['COMPLETED'];
                console.log(`🎉 Project completed: ${projectId}`);
            }
            project.updatedAt = new Date();
            this.projects.set(projectId, project);
            console.log(`✅ Milestone achieved: ${milestoneId}`);
            console.log(`   - Project: ${project.name}`);
            console.log(`   - Milestone: ${milestone.name}`);
            return {
                success: true,
                message: 'Milestone achieved successfully',
                txHash: releaseTxHash
            };
        }
        catch (error) {
            console.error('❌ Milestone achievement failed:', error);
            return {
                success: false,
                message: `Milestone achievement failed: ${error.message}`
            };
        }
    }
    /**
     * 프로젝트 정보 조회
     * @param projectId - 프로젝트 ID
     * @returns 프로젝트 데이터
     */
    getProject(projectId) {
        return this.projects.get(projectId);
    }
    /**
     * 모든 프로젝트 목록 조회
     * @returns 프로젝트 목록
     */
    getAllProjects() {
        return Array.from(this.projects.values());
    }
    /**
     * 활성 프로젝트 목록 조회
     * @returns 활성 프로젝트 목록
     */
    getActiveProjects() {
        return Array.from(this.projects.values()).filter(p => p.status === constants_1.PROJECT_STATUS['ACTIVE']);
    }
    /**
     * 투자 정보 조회
     * @param investmentId - 투자 ID
     * @returns 투자 데이터
     */
    getInvestment(investmentId) {
        return this.investments.get(investmentId);
    }
    /**
     * 프로젝트별 투자 목록 조회
     * @param projectId - 프로젝트 ID
     * @returns 투자 목록
     */
    getInvestmentsByProject(projectId) {
        return Array.from(this.investments.values()).filter(inv => inv.projectId === projectId);
    }
    /**
     * 토큰 가격 계산
     * @param project - 프로젝트 데이터
     * @returns 토큰 가격
     */
    calculateTokenPrice(project) {
        if (!project.mptData)
            return 0.1;
        // 간단한 가격 계산: 목표 금액 / 총 토큰 수
        return project.targetAmount / project.mptData.totalSupply;
    }
    /**
     * 마일스톤 증거 검증
     * @param milestone - 마일스톤 데이터
     * @param evidence - 증거
     * @returns 검증 결과
     */
    async verifyMilestoneEvidence(milestone, evidence) {
        // 실제 구현에서는 더 정교한 검증 로직 필요
        console.log(`🔍 Verifying milestone evidence: ${milestone.name}`);
        console.log(`   - Evidence type: ${evidence.type}`);
        console.log(`   - Evidence data: ${JSON.stringify(evidence, null, 2)}`);
        // 임시로 항상 성공
        return true;
    }
}
exports.ProjectManager = ProjectManager;
//# sourceMappingURL=ProjectManager.js.map