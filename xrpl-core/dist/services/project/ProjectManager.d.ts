import { Client } from 'xrpl';
import { ProjectData, InvestmentData, InvestmentRequest, InvestmentResult } from '../../types';
import { MPTManager } from '../mpt/MPTManager';
import { TokenEscrowManager } from '../escrow/TokenEscrowManager';
import { BatchManager } from '../batch/BatchManager';
import { WalletManager } from '../wallet/WalletManager';
/**
 * 프로젝트 관리 서비스
 * 프로젝트 생성, 투자 처리, 마일스톤 관리
 */
export declare class ProjectManager {
    private mptManager;
    private escrowManager;
    private batchManager;
    private walletManager;
    private projects;
    private investments;
    constructor(_xrplClient: Client, mptManager: MPTManager, escrowManager: TokenEscrowManager, batchManager: BatchManager, walletManager: WalletManager);
    /**
     * 새 프로젝트 생성
     * @param projectData - 프로젝트 데이터
     * @returns 프로젝트 생성 결과
     */
    createProject(projectData: {
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
    }): Promise<{
        success: boolean;
        projectId?: string;
        mptIssuanceId?: string;
        txHash?: string;
        message?: string;
    }>;
    /**
     * 프로젝트에 투자 처리
     * @param investmentRequest - 투자 요청
     * @returns 투자 처리 결과
     */
    processInvestment(investmentRequest: InvestmentRequest): Promise<InvestmentResult>;
    /**
     * 마일스톤 달성 처리
     * @param projectId - 프로젝트 ID
     * @param milestoneId - 마일스톤 ID
     * @param evidence - 달성 증거
     * @returns 마일스톤 달성 결과
     */
    achieveMilestone(projectId: string, milestoneId: string, evidence: any): Promise<{
        success: boolean;
        message: string;
        txHash?: string;
    }>;
    /**
     * 프로젝트 정보 조회
     * @param projectId - 프로젝트 ID
     * @returns 프로젝트 데이터
     */
    getProject(projectId: string): ProjectData | undefined;
    /**
     * 모든 프로젝트 목록 조회
     * @returns 프로젝트 목록
     */
    getAllProjects(): ProjectData[];
    /**
     * 활성 프로젝트 목록 조회
     * @returns 활성 프로젝트 목록
     */
    getActiveProjects(): ProjectData[];
    /**
     * 투자 정보 조회
     * @param investmentId - 투자 ID
     * @returns 투자 데이터
     */
    getInvestment(investmentId: string): InvestmentData | undefined;
    /**
     * 프로젝트별 투자 목록 조회
     * @param projectId - 프로젝트 ID
     * @returns 투자 목록
     */
    getInvestmentsByProject(projectId: string): InvestmentData[];
    /**
     * 토큰 가격 계산
     * @param project - 프로젝트 데이터
     * @returns 토큰 가격
     */
    private calculateTokenPrice;
    /**
     * 마일스톤 증거 검증
     * @param milestone - 마일스톤 데이터
     * @param evidence - 증거
     * @returns 검증 결과
     */
    private verifyMilestoneEvidence;
}
//# sourceMappingURL=ProjectManager.d.ts.map