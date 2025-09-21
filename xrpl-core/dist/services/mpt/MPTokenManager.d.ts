/**
 * MPTokens (Multi-Purpose Token) 핵심 기능 통합 클래스
 * XRPL의 새로운 펀저블 토큰 타입으로, 기존 IOU보다 단순한 발행·보유 모델 제공
 */
export declare class MPTokenManager {
    private client;
    private adminWallet;
    private userWallet?;
    constructor(adminSeed: string, userSeed?: string);
    /**
     * XRPL 클라이언트 연결
     */
    connect(): Promise<void>;
    /**
     * XRPL 클라이언트 연결 해제
     */
    disconnect(): Promise<void>;
    /**
     * 사용자 지갑 주소 반환
     */
    getUserAddress(): string | undefined;
    /**
     * MPT 발행 정의 생성
     * @param assetScale 소수점 자릿수 (기본값: 0)
     * @param maximumAmount 최대 발행량 (기본값: "1000000000")
     * @param flags 발행 정책 플래그
     * @param metadata 메타데이터 (hex 문자열, 선택사항)
     * @returns 발행 결과와 IssuanceID
     */
    createIssuance(assetScale?: number, maximumAmount?: string, flags?: {
        tfMPTCanTransfer?: boolean;
        tfMPTCanEscrow?: boolean;
        tfMPTRequireAuth?: boolean;
    }, metadata?: string): Promise<{
        result: any;
        issuanceId: string;
    }>;
    /**
     * 홀더 권한 부여 (RequireAuth 모드일 때 필요)
     * @param issuanceId 발행 ID
     * @param holderAddress 홀더 주소 (기본값: userWallet 주소)
     * @param isUnauthorize 권한 해제 여부 (기본값: false)
     */
    authorizeHolder(issuanceId: string, holderAddress?: string, isUnauthorize?: boolean): Promise<any>;
    /**
     * 사용자가 직접 Opt-in (권한 요청)
     * @param issuanceId 발행 ID
     */
    optIn(issuanceId: string): Promise<any>;
    /**
     * MPT 전송
     * @param issuanceId 발행 ID
     * @param destinationAddress 수신자 주소
     * @param amount 전송할 수량
     * @param fromAdmin 관리자가 전송하는지 여부 (기본값: true)
     */
    sendMPT(issuanceId: string, destinationAddress: string, amount: string, fromAdmin?: boolean): Promise<any>;
    /**
     * 발행 정의 삭제 (모든 홀더 잔액이 0일 때만 가능)
     * @param issuanceId 발행 ID
     */
    destroyIssuance(issuanceId: string): Promise<any>;
    /**
     * 완전한 MPT 생명주기 실행 (생성 → 권한부여 → 전송 → 삭제)
     * @param amount 전송할 수량
     * @param userAddress 사용자 주소 (선택사항)
     */
    runFullLifecycle(amount?: string, userAddress?: string): Promise<void>;
}
export declare function createMPToken(adminSeed: string, userSeed: string, assetScale?: number, maximumAmount?: string, metadata?: string): Promise<{
    result: any;
    issuanceId: string;
}>;
export declare function optInMPToken(userSeed: string, issuanceId: string): Promise<any>;
export declare function sendMPToken(adminSeed: string, userSeed: string, issuanceId: string, destinationAddress: string, amount: string, fromAdmin?: boolean): Promise<any>;
export declare function authorizeMPToken(adminSeed: string, issuanceId: string, holderAddress: string, isUnauthorize?: boolean): Promise<any>;
export declare function destroyMPToken(adminSeed: string, issuanceId: string): Promise<any>;
//# sourceMappingURL=MPTokenManager.d.ts.map