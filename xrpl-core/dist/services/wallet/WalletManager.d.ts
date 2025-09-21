import { Client, Wallet } from 'xrpl';
import { IssuerWalletData, WalletInfo, TransactionData, ValidationResult } from '../../types';
/**
 * 지갑 관리 서비스
 * 프로젝트별 발행자 지갑, 플랫폼 지갑 관리
 */
export declare class WalletManager {
    private client;
    private issuerWallets;
    private platformWallet;
    constructor(xrplClient: Client);
    /**
     * 플랫폼 마스터 지갑 초기화
     * @param masterSeed - 마스터 시드
     */
    initializePlatformWallet(masterSeed: string): Promise<void>;
    /**
     * 프로젝트별 발행자 지갑 생성 (핵심!)
     * @param projectId - 프로젝트 ID
     * @returns 생성된 지갑 정보
     */
    createIssuerWallet(projectId: string): Promise<Wallet>;
    /**
     * 플랫폼 마스터 지갑에서 발행자 지갑으로 자금 전송
     * @param destinationAddress - 대상 주소
     * @param amount - 전송할 XRP 양
     */
    fundWalletFromPlatform(destinationAddress: string, amount: string): Promise<any>;
    /**
     * 지갑별 Trust Line 설정
     * @param wallet - 지갑 객체
     * @param mptIssuanceId - MPT 발행 ID
     */
    setupTrustLine(wallet: Wallet, mptIssuanceId: string): Promise<any>;
    /**
     * 프로젝트 발행자 지갑 조회
     * @param projectId - 프로젝트 ID
     * @returns 발행자 지갑 정보
     */
    getIssuerWallet(projectId: string): Wallet;
    /**
     * 플랫폼 지갑 조회
     * @returns 플랫폼 지갑
     */
    getPlatformWallet(): Wallet;
    /**
     * 지갑 잔액 조회
     * @param address - 지갑 주소
     * @returns 잔액 정보
     */
    getWalletBalance(address: string): Promise<WalletInfo>;
    /**
     * 트랜잭션 제출
     * @param tx - 트랜잭션 객체
     * @param wallet - 서명할 지갑
     * @returns 제출 결과
     */
    submitTransaction(tx: TransactionData, wallet: Wallet): Promise<any>;
    /**
     * 모든 발행자 지갑 목록 조회
     * @returns 발행자 지갑 목록
     */
    getAllIssuerWallets(): IssuerWalletData[];
    /**
     * 프로젝트 발행자 지갑 비활성화
     * @param projectId - 프로젝트 ID
     */
    deactivateIssuerWallet(projectId: string): void;
    /**
     * 지갑 유효성 검증
     * @param wallet - 검증할 지갑
     * @returns 검증 결과
     */
    validateWallet(wallet: Wallet): ValidationResult;
    /**
     * XRP를 드롭으로 변환
     * @param xrp - XRP 양
     * @returns 드롭 양
     */
    private xrpToDrops;
    /**
     * 드롭을 XRP로 변환
     * @param drops - 드롭 양
     * @returns XRP 양
     */
    private dropsToXrp;
    /**
     * 지갑 통계 조회
     * @returns 지갑 통계
     */
    getWalletStats(): {
        total: number;
        active: number;
        inactive: number;
    };
    /**
     * 특정 프로젝트의 발행자 지갑 존재 여부 확인
     * @param projectId - 프로젝트 ID
     * @returns 존재 여부
     */
    hasIssuerWallet(projectId: string): boolean;
    /**
     * 발행자 지갑 활성화 상태 확인
     * @param projectId - 프로젝트 ID
     * @returns 활성화 여부
     */
    isIssuerWalletActive(projectId: string): boolean;
}
//# sourceMappingURL=WalletManager.d.ts.map