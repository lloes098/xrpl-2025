import { Client, Wallet } from 'xrpl';
import { MPTTokenData, TokenMetadata, ValidationResult } from '../../types';
import { WalletManager } from '../wallet/WalletManager';
/**
 * MPT 토큰 관리 서비스
 * MPT 토큰 생성, 발행, 전송 관리
 */
export declare class MPTManager {
    private client;
    private walletManager;
    private mptTokens;
    constructor(xrplClient: Client, walletManager: WalletManager);
    /**
     * 프로젝트용 MPT 토큰 생성
     * @param projectData - 프로젝트 데이터
     * @returns MPT 토큰 데이터
     */
    createProjectMPT(projectData: {
        projectId: string;
        name: string;
        description: string;
        totalTokens: number;
        targetAmount: number;
        website?: string;
        logo?: string;
        category?: string;
        tags?: string[];
        socialLinks?: Record<string, string>;
    }): Promise<MPTTokenData>;
    /**
     * 토큰 발행 (투자자/플랫폼에게)
     * @param mptData - MPT 토큰 데이터
     * @param recipient - 수신자 주소
     * @param amount - 발행할 토큰 양
     * @returns 발행 결과
     */
    mintTokens(mptData: MPTTokenData, recipient: string, amount: number): Promise<any>;
    /**
     * 토큰 전송
     * @param fromAddress - 발신자 주소
     * @param toAddress - 수신자 주소
     * @param mptIssuanceId - MPT 발행 ID
     * @param amount - 전송할 토큰 양
     * @param senderWallet - 발신자 지갑
     * @returns 전송 결과
     */
    transferTokens(fromAddress: string, toAddress: string, mptIssuanceId: string, amount: number, senderWallet: Wallet): Promise<any>;
    /**
     * Trust Line 설정
     * @param address - 지갑 주소
     * @param mptIssuanceId - MPT 발행 ID
     */
    setupTrustLine(address: string, mptIssuanceId: string): Promise<void>;
    /**
     * 토큰 잔액 조회 (최신 API)
     * @param address - 지갑 주소
     * @param mptIssuanceId - MPT 발행 ID
     * @returns 토큰 잔액
     */
    getTokenBalance(address: string, mptIssuanceId: string): Promise<number>;
    /**
     * MPT 토큰 정보 조회
     * @param projectId - 프로젝트 ID
     * @returns MPT 토큰 정보
     */
    getMPTToken(projectId: string): MPTTokenData;
    /**
     * 모든 MPT 토큰 목록 조회
     * @returns MPT 토큰 목록
     */
    getAllMPTTokens(): MPTTokenData[];
    /**
     * 메타데이터 구성
     * @param data - 메타데이터 데이터
     * @returns HEX 인코딩된 메타데이터
     */
    buildMetadata(data: {
        name: string;
        description: string;
        projectId: string;
        totalSupply: number;
        targetAmount: number;
        website?: string;
        logo?: string;
        category?: string;
        tags?: string[];
        socialLinks?: Record<string, string>;
    }): {
        metadata: TokenMetadata;
        hexMetadata: string;
    };
    /**
     * MPT 발행 ID 추출
     * @param result - 트랜잭션 결과
     * @returns MPT 발행 ID
     */
    private extractMPTIssuanceId;
    /**
     * 토큰 심볼 생성
     * @param name - 토큰 이름
     * @returns 생성된 심볼
     */
    private generateSymbol;
    /**
     * 프로젝트 ID로 발행 ID 조회
     * @param mptIssuanceId - MPT 발행 ID
     * @returns 프로젝트 ID
     */
    private getProjectIdByIssuanceId;
    /**
     * 트랜잭션 제출
     * @param tx - 트랜잭션 객체
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
     * MPT 토큰 비활성화
     * @param projectId - 프로젝트 ID
     */
    deactivateMPTToken(projectId: string): void;
    /**
     * 토큰 유효성 검증
     * @param mptData - MPT 토큰 데이터
     * @returns 검증 결과
     */
    validateMPTToken(mptData: MPTTokenData): ValidationResult;
}
//# sourceMappingURL=MPTManager.d.ts.map