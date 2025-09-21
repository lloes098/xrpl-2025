"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPTokenManager = void 0;
exports.createMPToken = createMPToken;
exports.optInMPToken = optInMPToken;
exports.sendMPToken = sendMPToken;
exports.authorizeMPToken = authorizeMPToken;
exports.destroyMPToken = destroyMPToken;
const xrpl_1 = require("xrpl");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
/**
 * MPTokens (Multi-Purpose Token) 핵심 기능 통합 클래스
 * XRPL의 새로운 펀저블 토큰 타입으로, 기존 IOU보다 단순한 발행·보유 모델 제공
 */
class MPTokenManager {
    constructor(adminSeed, userSeed) {
        this.client = new xrpl_1.Client("wss://s.devnet.rippletest.net:51233");
        this.adminWallet = xrpl_1.Wallet.fromSeed(adminSeed);
        if (userSeed) {
            this.userWallet = xrpl_1.Wallet.fromSeed(userSeed);
        }
    }
    /**
     * XRPL 클라이언트 연결
     */
    async connect() {
        await this.client.connect();
    }
    /**
     * XRPL 클라이언트 연결 해제
     */
    async disconnect() {
        await this.client.disconnect();
    }
    /**
     * 사용자 지갑 주소 반환
     */
    getUserAddress() {
        return this.userWallet?.address;
    }
    /**
     * MPT 발행 정의 생성
     * @param assetScale 소수점 자릿수 (기본값: 0)
     * @param maximumAmount 최대 발행량 (기본값: "1000000000")
     * @param flags 발행 정책 플래그
     * @param metadata 메타데이터 (hex 문자열, 선택사항)
     * @returns 발행 결과와 IssuanceID
     */
    async createIssuance(assetScale = 0, maximumAmount = "1000000000", flags = {
        tfMPTCanTransfer: true,
        tfMPTCanEscrow: true,
        tfMPTRequireAuth: false
    }, metadata) {
        // 메타데이터 처리: 제공된 metadata가 있으면 사용, 없으면 기본값 사용
        let mptMetadata;
        if (metadata) {
            try {
                // JSON 문자열을 파싱
                mptMetadata = JSON.parse(metadata);
                console.log('사용자 제공 메타데이터 사용:', mptMetadata);
            }
            catch (error) {
                console.warn('메타데이터 파싱 실패, 기본값 사용:', error);
                // 파싱 실패 시 기본값 사용
                mptMetadata = {
                    name: 'Test Project Token',
                    description: 'A test MPT token for project funding',
                    projectId: 'test_project_001',
                    totalSupply: parseInt(maximumAmount),
                    targetAmount: 10000,
                    website: 'https://testproject.com',
                    logo: 'https://testproject.com/logo.png',
                    category: 'Technology',
                    tags: ['blockchain', 'defi', 'test'],
                    socialLinks: {
                        twitter: 'https://twitter.com/testproject',
                        discord: 'https://discord.gg/testproject'
                    }
                };
            }
        }
        else {
            // 기본 메타데이터 사용
            mptMetadata = {
                name: 'Test Project Token',
                description: 'A test MPT token for project funding',
                projectId: 'test_project_001',
                totalSupply: parseInt(maximumAmount),
                targetAmount: 10000,
                website: 'https://testproject.com',
                logo: 'https://testproject.com/logo.png',
                category: 'Technology',
                tags: ['blockchain', 'defi', 'test'],
                socialLinks: {
                    twitter: 'https://twitter.com/testproject',
                    discord: 'https://discord.gg/testproject'
                }
            };
        }
        // 메타데이터를 hex로 변환
        const metadataJson = JSON.stringify(mptMetadata);
        const metadataHex = Buffer.from(metadataJson, 'utf8').toString('hex').toUpperCase();
        const tx = {
            TransactionType: "MPTokenIssuanceCreate",
            Account: this.adminWallet.address,
            AssetScale: assetScale,
            MaximumAmount: maximumAmount,
            TransferFee: 0,
            Flags: 0,
            MPTokenMetadata: metadataHex
        };
        try {
            // xrpl-core 방식으로 트랜잭션 제출
            const result = await this.client.submitAndWait(tx, { wallet: this.adminWallet });
            console.log("발행 생성 결과:", JSON.stringify(result, null, 2));
            // IssuanceID 추출
            const issuanceId = result.result.meta?.mpt_issuance_id;
            if (issuanceId) {
                console.log(`IssuanceID(created): ${issuanceId}`);
                return { result, issuanceId };
            }
            else {
                throw new Error("IssuanceID를 찾을 수 없습니다.");
            }
        }
        catch (error) {
            console.error("발행 생성 실패:", error);
            throw error;
        }
    }
    /**
     * 홀더 권한 부여 (RequireAuth 모드일 때 필요)
     * @param issuanceId 발행 ID
     * @param holderAddress 홀더 주소 (기본값: userWallet 주소)
     * @param isUnauthorize 권한 해제 여부 (기본값: false)
     */
    async authorizeHolder(issuanceId, holderAddress, isUnauthorize = false) {
        if (!this.userWallet && !holderAddress) {
            throw new Error("홀더 주소가 필요합니다.");
        }
        const tx = {
            TransactionType: "MPTokenAuthorize",
            Account: this.adminWallet.address,
            MPTokenIssuanceID: issuanceId,
            Holder: holderAddress || this.userWallet.address,
            ...(isUnauthorize && { Flags: { tfMPTUnauthorize: true } })
        };
        try {
            const prepared = await this.client.autofill(tx);
            const signed = this.adminWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            console.log("권한 부여 결과:", JSON.stringify(result, null, 2));
            return result;
        }
        catch (error) {
            console.error("권한 부여 실패:", error);
            throw error;
        }
    }
    /**
     * 사용자가 직접 Opt-in (권한 요청)
     * @param issuanceId 발행 ID
     */
    async optIn(issuanceId) {
        if (!this.userWallet) {
            throw new Error("사용자 지갑이 필요합니다.");
        }
        const tx = {
            TransactionType: "MPTokenAuthorize",
            Account: this.userWallet.address,
            MPTokenIssuanceID: issuanceId
        };
        try {
            const prepared = await this.client.autofill(tx);
            const signed = this.userWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            console.log("Opt-in 결과:", JSON.stringify(result, null, 2));
            return result;
        }
        catch (error) {
            console.error("Opt-in 실패:", error);
            throw error;
        }
    }
    /**
     * MPT 전송
     * @param issuanceId 발행 ID
     * @param destinationAddress 수신자 주소
     * @param amount 전송할 수량
     * @param fromAdmin 관리자가 전송하는지 여부 (기본값: true)
     */
    async sendMPT(issuanceId, destinationAddress, amount, fromAdmin = true) {
        const senderWallet = fromAdmin ? this.adminWallet : this.userWallet;
        if (!senderWallet) {
            throw new Error("전송자 지갑이 필요합니다.");
        }
        const tx = {
            TransactionType: "Payment",
            Account: senderWallet.address,
            Destination: destinationAddress,
            Amount: {
                mpt_issuance_id: issuanceId,
                value: amount
            }
        };
        try {
            const prepared = await this.client.autofill(tx);
            const signed = senderWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            console.log("MPT 전송 결과:", JSON.stringify(result, null, 2));
            return result;
        }
        catch (error) {
            console.error("MPT 전송 실패:", error);
            throw error;
        }
    }
    /**
     * 발행 정의 삭제 (모든 홀더 잔액이 0일 때만 가능)
     * @param issuanceId 발행 ID
     */
    async destroyIssuance(issuanceId) {
        const tx = {
            TransactionType: "MPTokenIssuanceDestroy",
            Account: this.adminWallet.address,
            MPTokenIssuanceID: issuanceId
        };
        try {
            const prepared = await this.client.autofill(tx);
            const signed = this.adminWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            console.log("발행 삭제 결과:", JSON.stringify(result, null, 2));
            return result;
        }
        catch (error) {
            console.error("발행 삭제 실패:", error);
            throw error;
        }
    }
    /**
     * 완전한 MPT 생명주기 실행 (생성 → 권한부여 → 전송 → 삭제)
     * @param amount 전송할 수량
     * @param userAddress 사용자 주소 (선택사항)
     */
    async runFullLifecycle(amount = "1000", userAddress) {
        try {
            console.log("=== MPT 생명주기 시작 ===");
            // 1. 발행 생성
            console.log("1. 발행 생성 중...");
            const { issuanceId } = await this.createIssuance();
            // 2. 권한 부여 (RequireAuth가 true인 경우)
            console.log("2. 권한 부여 중...");
            await this.authorizeHolder(issuanceId, userAddress);
            // 3. MPT 전송
            console.log("3. MPT 전송 중...");
            const destination = userAddress || this.userWallet?.address;
            if (!destination) {
                throw new Error("전송 대상 주소가 필요합니다.");
            }
            await this.sendMPT(issuanceId, destination, amount);
            // 4. 발행 삭제 (선택사항)
            console.log("4. 발행 삭제 중...");
            await this.destroyIssuance(issuanceId);
            console.log("=== MPT 생명주기 완료 ===");
        }
        catch (error) {
            console.error("MPT 생명주기 실행 실패:", error);
            throw error;
        }
    }
}
exports.MPTokenManager = MPTokenManager;
// 개별 기능들을 위한 헬퍼 함수들
async function createMPToken(adminSeed, userSeed, assetScale = 0, maximumAmount = "1000000000", metadata) {
    const mptManager = new MPTokenManager(adminSeed, userSeed);
    try {
        await mptManager.connect();
        const flags = {
            tfMPTCanTransfer: true,
            tfMPTCanEscrow: true,
            tfMPTRequireAuth: false
        };
        return await mptManager.createIssuance(assetScale, maximumAmount, flags, metadata);
    }
    finally {
        await mptManager.disconnect();
    }
}
async function optInMPToken(userSeed, issuanceId) {
    const mptManager = new MPTokenManager("sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", userSeed);
    try {
        await mptManager.connect();
        return await mptManager.optIn(issuanceId);
    }
    finally {
        await mptManager.disconnect();
    }
}
async function sendMPToken(adminSeed, userSeed, issuanceId, destinationAddress, amount, fromAdmin = true) {
    const mptManager = new MPTokenManager(adminSeed, userSeed);
    try {
        await mptManager.connect();
        return await mptManager.sendMPT(issuanceId, destinationAddress, amount, fromAdmin);
    }
    finally {
        await mptManager.disconnect();
    }
}
async function authorizeMPToken(adminSeed, issuanceId, holderAddress, isUnauthorize = false) {
    const mptManager = new MPTokenManager(adminSeed);
    try {
        await mptManager.connect();
        return await mptManager.authorizeHolder(issuanceId, holderAddress, isUnauthorize);
    }
    finally {
        await mptManager.disconnect();
    }
}
async function destroyMPToken(adminSeed, issuanceId) {
    const mptManager = new MPTokenManager(adminSeed);
    try {
        await mptManager.connect();
        return await mptManager.destroyIssuance(issuanceId);
    }
    finally {
        await mptManager.disconnect();
    }
}
//# sourceMappingURL=MPTokenManager.js.map