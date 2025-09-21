import { Client } from 'xrpl';
import { EscrowData, EscrowResult, ReleaseResult } from '../../types';
/**
 * 토큰 에스크로 관리 서비스
 * 투자금을 조건부로 보관하고 마일스톤 달성 시 해제
 */
export declare class TokenEscrowManager {
    private client;
    private escrows;
    constructor(xrplClient: Client);
    /**
     * 투자금 에스크로 생성
     * @param escrowData - 에스크로 데이터
     * @returns 에스크로 생성 결과
     */
    createInvestmentEscrow(escrowData: EscrowData): Promise<EscrowResult>;
    /**
     * 에스크로 해제 (마일스톤 달성 시)
     * @param escrowId - 에스크로 ID
     * @param milestoneEvidence - 마일스톤 달성 증거
     * @returns 에스크로 해제 결과
     */
    releaseEscrow(escrowId: string, milestoneEvidence: any): Promise<ReleaseResult>;
    /**
     * 에스크로 취소 (시간 초과 또는 프로젝트 실패 시)
     * @param escrowId - 에스크로 ID
     * @param reason - 취소 사유
     * @returns 에스크로 취소 결과
     */
    cancelEscrow(escrowId: string, reason: string): Promise<ReleaseResult>;
    /**
     * 에스크로 정보 조회
     * @param escrowId - 에스크로 ID
     * @returns 에스크로 데이터
     */
    getEscrow(escrowId: string): EscrowData | undefined;
    /**
     * 프로젝트별 에스크로 목록 조회
     * @param projectId - 프로젝트 ID
     * @returns 에스크로 목록
     */
    getEscrowsByProject(projectId: string): EscrowData[];
    /**
     * 크립토 조건 생성 (공식 예시 기반)
     * @param milestoneId - 마일스톤 ID
     * @returns 크립토 조건과 fulfillment
     */
    private generateCryptoCondition;
    /**
     * 마일스톤 달성 검증
     * @param escrowData - 에스크로 데이터
     * @param evidence - 달성 증거
     * @returns 검증 결과
     */
    private verifyMilestoneAchievement;
    /**
     * GitHub 증거 검증
     * @param evidence - GitHub 증거
     * @returns 검증 결과
     */
    private verifyGitHubEvidence;
    /**
     * 외부 검증 서비스 증거 검증
     * @param evidence - 외부 증거
     * @returns 검증 결과
     */
    private verifyExternalEvidence;
    /**
     * 수동 승인 검증
     * @param evidence - 수동 승인 증거
     * @returns 검증 결과
     */
    private verifyManualApproval;
    /**
     * 에스크로 트랜잭션 검증
     * @param tx - 트랜잭션 데이터
     */
    private validateEscrowTransaction;
    /**
     * 에스크로 해제 트랜잭션 검증
     * @param tx - 트랜잭션 데이터
     */
    private validateEscrowFinishTransaction;
    /**
     * 트랜잭션 제출
     * @param tx - 트랜잭션 데이터
     * @param wallet - 서명할 지갑
     * @returns 제출 결과
     */
    private submitTransaction;
    /**
     * XRP를 드롭으로 변환
     * @param xrp - XRP 양
     * @returns 드롭 양
     */
    private xrpToDrops;
    /**
     * 날짜를 Ripple 시간으로 변환
     * @param date - 날짜
     * @returns Ripple 시간
     */
    private dateToRippleTime;
}
//# sourceMappingURL=TokenEscrowManager.d.ts.map