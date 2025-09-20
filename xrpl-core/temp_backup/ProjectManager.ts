import { Client } from 'xrpl';
import { ProjectData, MilestoneData, InvestmentData, InvestmentRequest, InvestmentResult } from '../../types';
import { PROJECT_STATUS, MILESTONE_STATUS, INVESTMENT_STATUS } from '../../config/constants';
import { MPTManager } from '../mpt/MPTManager';
import { TokenEscrowManager } from '../escrow/TokenEscrowManager';
import { BatchManager } from '../batch/BatchManager';
import { WalletManager } from '../wallet/WalletManager';

/**
 * 프로젝트 관리 서비스
 * 프로젝트 생성, 투자 처리, 마일스톤 관리
 */
export class ProjectManager {
  // private _client: Client; // 사용하지 않음
  private mptManager: MPTManager;
  private escrowManager: TokenEscrowManager;
  private batchManager: BatchManager;
  private walletManager: WalletManager;
  private projects: Map<string, ProjectData> = new Map();
  private investments: Map<string, InvestmentData> = new Map();

  constructor(
    xrplClient: Client,
    mptManager: MPTManager,
    escrowManager: TokenEscrowManager,
    batchManager: BatchManager,
    walletManager: WalletManager
  ) {
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
  async createProject(projectData: {
    name: string;
    description: string;
    targetAmount: number;
    deadline: Date;
    creatorWallet: string;
    website?: string;
    logo?: string;
    category?: string;
    tags?: string[];
    socialLinks?: Record<string, string>;
    tokenomics: {
      totalTokens: number;
      tokenPrice: number;
      platformTokenShare: number;
      creatorTokenShare: number;
      investorTokenShare: number;
    };
    milestones: Array<{
      name: string;
      description: string;
      targetAmount: number;
      deadline: Date;
      evidence?: string;
    }>;
  }): Promise<{ success: boolean; projectId?: string; mptIssuanceId?: string; txHash?: string; message?: string }> {
    try {
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. 프로젝트용 MPT 토큰 생성
      const mptData = await this.mptManager.createProjectMPT({
        projectId,
        name: projectData.name,
        description: projectData.description,
        totalTokens: projectData.tokenomics.totalTokens,
        targetAmount: projectData.targetAmount,
        website: projectData.website,
        logo: projectData.logo,
        category: projectData.category,
        tags: projectData.tags,
        socialLinks: projectData.socialLinks
      });

      // 2. 마일스톤 데이터 생성
      const milestones: MilestoneData[] = projectData.milestones.map((milestone, index) => ({
        id: `milestone_${projectId}_${index + 1}`,
        projectId,
        name: milestone.name,
        description: milestone.description,
        targetAmount: milestone.targetAmount,
        status: MILESTONE_STATUS.PENDING,
        deadline: milestone.deadline,
        evidence: milestone.evidence,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // 3. 프로젝트 데이터 생성
      const project: ProjectData = {
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
        status: PROJECT_STATUS.ACTIVE,
        website: projectData.website,
        logo: projectData.logo,
        category: projectData.category,
        tags: projectData.tags,
        socialLinks: projectData.socialLinks,
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
    } catch (error) {
      console.error('❌ Project creation failed:', error);
      return {
        success: false,
        message: `Project creation failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 프로젝트에 투자 처리
   * @param investmentRequest - 투자 요청
   * @returns 투자 처리 결과
   */
  async processInvestment(investmentRequest: InvestmentRequest): Promise<InvestmentResult> {
    try {
      const project = this.projects.get(investmentRequest.projectId);
      if (!project) {
        throw new Error(`Project not found: ${investmentRequest.projectId}`);
      }

      if (project.status !== PROJECT_STATUS.ACTIVE) {
        throw new Error(`Project is not active: ${project.status}`);
      }

      // 1. 투자 금액 검증
      if (investmentRequest.rlusdAmount <= 0) {
        throw new Error('Invalid investment amount');
      }

      // 2. 수수료 계산
      const platformFee = investmentRequest.rlusdAmount * 0.05; // 5% 플랫폼 수수료
      const netInvestment = investmentRequest.rlusdAmount - platformFee;

      // 3. 토큰 할당 계산
      const tokenPrice = project.mptData ? this.calculateTokenPrice(project) : 0.1;
      const tokensToReceive = Math.floor(netInvestment / tokenPrice);

      // 4. 배치 트랜잭션 실행 (자금 전송 + 토큰 발행)
      const batchResult = await this.batchManager.executeInvestmentBatch({
        investorWallet: investmentRequest.investorWallet,
        projectWallet: project.creatorWallet,
        platformWallet: this.walletManager.getPlatformWallet()?.address || '',
        investmentAmount: netInvestment,
        platformFee,
        mptIssuanceId: project.mptData?.mptIssuanceId || '',
        tokenAmount: tokensToReceive
      });

      if (!batchResult.success) {
        throw new Error('Investment batch transaction failed');
      }

      // 5. 투자 데이터 생성
      const investmentId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const investment: InvestmentData = {
        id: investmentId,
        projectId: investmentRequest.projectId,
        investorAddress: investmentRequest.investorWallet.address,
        amount: investmentRequest.rlusdAmount,
        tokens: tokensToReceive,
        rlusdAmount: investmentRequest.rlusdAmount,
        tokenAmount: tokensToReceive,
        investmentType: 'equity' as any,
        riskLevel: 'medium' as any,
        status: INVESTMENT_STATUS.CONFIRMED,
        txHash: batchResult.hash || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 6. 투자 데이터 저장
      this.investments.set(investmentId, investment);
      project.investors.set(investmentId, investment);
      project.currentAmount += investmentRequest.rlusdAmount;

      // 7. 프로젝트 상태 업데이트
      if (project.currentAmount >= project.targetAmount) {
        project.status = PROJECT_STATUS.FUNDED;
      }

      project.updatedAt = new Date();
      this.projects.set(investmentRequest.projectId, project);

      // 8. 에스크로 생성 (조건부 자금 보관)
      const escrowResult = await this.escrowManager.createInvestmentEscrow({
        id: `escrow_${investmentId}`,
        projectId: investmentRequest.projectId,
        investorAddress: investmentRequest.investorWallet.address,
        mptIssuanceId: project.mptData?.mptIssuanceId || '',
        tokenAmount: tokensToReceive,
        rlusdAmount: netInvestment,
        deadline: project.deadline,
        conditionType: 'milestone',
        milestoneId: project.milestones[0]?.id,
        projectWallet: project.creatorWallet,
        investorSeed: investmentRequest.investorWallet.privateKey,
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`✅ Investment processed: ${investmentId}`);
      console.log(`   - Project: ${project.name}`);
      console.log(`   - Amount: ${investmentRequest.rlusdAmount} XRP`);
      console.log(`   - Tokens: ${tokensToReceive} MPT`);
      console.log(`   - Platform Fee: ${platformFee} XRP`);
      console.log(`   - Batch Hash: ${batchResult.hash}`);

      return {
        success: true,
        investmentId,
        txHash: batchResult.hash,
        tokensReceived: tokensToReceive,
        message: 'Investment processed successfully'
      };
    } catch (error) {
      console.error('❌ Investment processing failed:', error);
      return {
        success: false,
        message: `Investment processing failed: ${(error as Error).message}`
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
  async achieveMilestone(
    projectId: string,
    milestoneId: string,
    evidence: any
  ): Promise<{ success: boolean; message: string; txHash?: string }> {
    try {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error(`Milestone not found: ${milestoneId}`);
      }

      if (milestone.status !== MILESTONE_STATUS.PENDING) {
        throw new Error(`Milestone already processed: ${milestone.status}`);
      }

      // 1. 마일스톤 검증 (실제 구현에서는 더 정교한 검증 필요)
      const isValidMilestone = await this.verifyMilestoneEvidence(milestone, evidence);
      if (!isValidMilestone) {
        throw new Error('Milestone verification failed');
      }

      // 2. 마일스톤 상태 업데이트
      milestone.status = MILESTONE_STATUS.COMPLETED;
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
      const completedMilestones = project.milestones.filter(m => m.status === MILESTONE_STATUS.COMPLETED);
      if (completedMilestones.length === project.milestones.length) {
        project.status = PROJECT_STATUS.COMPLETED;
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
    } catch (error) {
      console.error('❌ Milestone achievement failed:', error);
      return {
        success: false,
        message: `Milestone achievement failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 프로젝트 정보 조회
   * @param projectId - 프로젝트 ID
   * @returns 프로젝트 데이터
   */
  getProject(projectId: string): ProjectData | undefined {
    return this.projects.get(projectId);
  }

  /**
   * 모든 프로젝트 목록 조회
   * @returns 프로젝트 목록
   */
  getAllProjects(): ProjectData[] {
    return Array.from(this.projects.values());
  }

  /**
   * 활성 프로젝트 목록 조회
   * @returns 활성 프로젝트 목록
   */
  getActiveProjects(): ProjectData[] {
    return Array.from(this.projects.values()).filter(p => p.status === PROJECT_STATUS.ACTIVE);
  }

  /**
   * 투자 정보 조회
   * @param investmentId - 투자 ID
   * @returns 투자 데이터
   */
  getInvestment(investmentId: string): InvestmentData | undefined {
    return this.investments.get(investmentId);
  }

  /**
   * 프로젝트별 투자 목록 조회
   * @param projectId - 프로젝트 ID
   * @returns 투자 목록
   */
  getInvestmentsByProject(projectId: string): InvestmentData[] {
    return Array.from(this.investments.values()).filter(inv => inv.projectId === projectId);
  }

  /**
   * 토큰 가격 계산
   * @param project - 프로젝트 데이터
   * @returns 토큰 가격
   */
  private calculateTokenPrice(project: ProjectData): number {
    if (!project.mptData) return 0.1;
    
    // 간단한 가격 계산: 목표 금액 / 총 토큰 수
    return project.targetAmount / project.mptData.totalSupply;
  }

  /**
   * 마일스톤 증거 검증
   * @param milestone - 마일스톤 데이터
   * @param evidence - 증거
   * @returns 검증 결과
   */
  private async verifyMilestoneEvidence(milestone: MilestoneData, evidence: any): Promise<boolean> {
    // 실제 구현에서는 더 정교한 검증 로직 필요
    console.log(`🔍 Verifying milestone evidence: ${milestone.name}`);
    console.log(`   - Evidence type: ${evidence.type}`);
    console.log(`   - Evidence data: ${JSON.stringify(evidence, null, 2)}`);
    
    // 임시로 항상 성공
    return true;
  }
}
