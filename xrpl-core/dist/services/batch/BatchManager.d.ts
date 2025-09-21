import { Client, Wallet } from 'xrpl';
import { BatchResult } from '../../types';
/**
 * 배치 트랜잭션 관리 서비스 (공식 예시 기반)
 * 여러 XRPL 트랜잭션을 원자적으로 실행
 */
export declare class BatchManager {
    private client;
    private batchHistory;
    constructor(xrplClient: Client);
    /**
     * 투자 배치 트랜잭션 실행 (공식 예시 기반)
     * @param batchData - 배치 트랜잭션 데이터
     * @returns 배치 실행 결과
     */
    executeInvestmentBatch(batchData: {
        investorWallet: Wallet;
        projectWallet: string;
        platformWallet: string;
        investmentAmount: number;
        platformFee: number;
        mptIssuanceId: string;
        tokenAmount: number;
        multiSigSigners?: Wallet[];
    }): Promise<BatchResult>;
    /**
     * 수익 분배 배치 트랜잭션 실행
     * @param distributionData - 분배 데이터
     * @returns 배치 실행 결과
     */
    executeDistributionBatch(distributionData: {
        projectWallet: string;
        platformWallet: string;
        totalRevenue: number;
        platformShare: number;
        creatorShare: number;
        investorDistributions: Array<{
            investorAddress: string;
            amount: number;
        }>;
        signerWallet: Wallet;
    }): Promise<BatchResult>;
    /**
     * 토큰 전송 배치 트랜잭션 실행
     * @param tokenTransferData - 토큰 전송 데이터
     * @returns 배치 실행 결과
     */
    executeTokenTransferBatch(tokenTransferData: {
        fromWallet: Wallet;
        transfers: Array<{
            toAddress: string;
            mptIssuanceId: string;
            amount: number;
        }>;
    }): Promise<BatchResult>;
    /**
     * 내부 Payment 트랜잭션 생성 (공식 예시 방식)
     * @param paymentData - 결제 데이터
     * @returns RawTransaction
     */
    private createInnerPayment;
    /**
     * 내부 토큰 전송 트랜잭션 생성
     * @param transferData - 전송 데이터
     * @returns RawTransaction
     */
    private createInnerTokenTransfer;
    /**
     * 배치 플래그 생성 (공식 예시 방식)
     * @param mode - 배치 모드
     * @returns 플래그 값
     */
    private getBatchFlags;
    /**
     * 배치 트랜잭션 검증
     * @param batchTx - 배치 트랜잭션
     */
    private validateBatchTransaction;
    /**
     * 배치 트랜잭션 제출 (공식 예시 방식)
     * @param batchTx - 배치 트랜잭션
     * @param wallet - 서명할 지갑
     * @returns 제출 결과
     */
    private submitBatchTransaction;
    /**
     * 배치 결과 조회
     * @param batchId - 배치 ID
     * @returns 배치 결과
     */
    getBatchResult(batchId: string): BatchResult | undefined;
    /**
     * 모든 배치 결과 조회
     * @returns 배치 결과 목록
     */
    getAllBatchResults(): BatchResult[];
    /**
     * XRP를 드롭으로 변환
     * @param xrp - XRP 양
     * @returns 드롭 양
     */
    private xrpToDrops;
}
//# sourceMappingURL=BatchManager.d.ts.map