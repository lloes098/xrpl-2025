"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletManager = void 0;
const xrpl_1 = require("xrpl");
const constants_1 = require("../../config/constants");
/**
 * 지갑 관리 서비스
 * 프로젝트별 발행자 지갑, 플랫폼 지갑 관리
 */
class WalletManager {
    constructor(xrplClient) {
        this.issuerWallets = new Map();
        this.platformWallet = null;
        this.client = xrplClient;
    }
    /**
     * 플랫폼 마스터 지갑 초기화
     * @param masterSeed - 마스터 시드
     */
    async initializePlatformWallet(masterSeed) {
        if (!masterSeed) {
            throw new Error('Platform master seed is required');
        }
        this.platformWallet = xrpl_1.Wallet.fromSeed(masterSeed);
        try {
            // 지갑 활성화 확인
            const accountInfo = await this.client.request({
                command: 'account_info',
                account: this.platformWallet.address
            });
            if (accountInfo.result.account_data.Balance === '0') {
                console.log(`Platform wallet not funded, funding via Devnet faucet: ${this.platformWallet.address}`);
                // Devnet faucet으로 펀딩
                await this.client.fundWallet(this.platformWallet);
                console.log('Platform wallet funded successfully');
            }
            else {
                console.log(`Platform wallet already funded: ${this.platformWallet.address}`);
            }
        }
        catch (error) {
            // 계정이 존재하지 않는 경우 faucet으로 펀딩
            console.log(`Platform wallet not found, funding via Devnet faucet: ${this.platformWallet.address}`);
            await this.client.fundWallet(this.platformWallet);
            console.log('Platform wallet funded successfully');
        }
        console.log(`Platform wallet initialized: ${this.platformWallet.address}`);
    }
    /**
     * 프로젝트별 발행자 지갑 생성 (핵심!)
     * @param projectId - 프로젝트 ID
     * @returns 생성된 지갑 정보
     */
    async createIssuerWallet(projectId) {
        // Devnet용 지갑 생성 (네트워크 ID 2)
        const wallet = xrpl_1.Wallet.generate();
        // Devnet faucet을 사용하여 지갑 활성화
        try {
            await this.client.fundWallet(wallet);
            console.log(`Issuer wallet funded via Devnet faucet: ${wallet.address}`);
        }
        catch (error) {
            console.warn(`Failed to fund via faucet, trying platform wallet: ${error}`);
            // Faucet 실패 시 플랫폼 지갑 사용
            await this.fundWalletFromPlatform(wallet.address, '10'); // 10 XRP
        }
        this.issuerWallets.set(projectId, {
            wallet,
            projectId,
            createdAt: new Date(),
            isActive: true
        });
        console.log(`Issuer wallet created for project ${projectId}: ${wallet.address}`);
        return wallet;
    }
    /**
     * 플랫폼 마스터 지갑에서 발행자 지갑으로 자금 전송
     * @param destinationAddress - 대상 주소
     * @param amount - 전송할 XRP 양
     */
    async fundWalletFromPlatform(destinationAddress, amount) {
        if (!this.platformWallet) {
            throw new Error('Platform wallet not initialized');
        }
        const tx = {
            TransactionType: constants_1.TRANSACTION_TYPES.PAYMENT,
            Account: this.platformWallet.address,
            Destination: destinationAddress,
            Amount: this.xrpToDrops(amount),
            Fee: this.xrpToDrops('0.001')
        };
        return await this.submitTransaction(tx, this.platformWallet);
    }
    /**
     * 지갑별 Trust Line 설정
     * @param wallet - 지갑 객체
     * @param mptIssuanceId - MPT 발행 ID
     */
    async setupTrustLine(wallet, mptIssuanceId) {
        const tx = {
            TransactionType: constants_1.TRANSACTION_TYPES.MPT_AUTHORIZE,
            Account: wallet.address,
            Amount: '0', // Trust Line 설정 시에는 0
            MPTokenIssuanceID: mptIssuanceId
        };
        return await this.submitTransaction(tx, wallet);
    }
    /**
     * 프로젝트 발행자 지갑 조회
     * @param projectId - 프로젝트 ID
     * @returns 발행자 지갑 정보
     */
    getIssuerWallet(projectId) {
        const issuerData = this.issuerWallets.get(projectId);
        if (!issuerData) {
            throw new Error(`Issuer wallet not found for project: ${projectId}`);
        }
        return issuerData.wallet;
    }
    /**
     * 플랫폼 지갑 조회
     * @returns 플랫폼 지갑
     */
    getPlatformWallet() {
        if (!this.platformWallet) {
            throw new Error('Platform wallet not initialized');
        }
        return this.platformWallet;
    }
    /**
     * 지갑 잔액 조회
     * @param address - 지갑 주소
     * @returns 잔액 정보
     */
    async getWalletBalance(address) {
        const accountInfo = await this.client.request({
            command: 'account_info',
            account: address
        });
        return {
            address,
            publicKey: accountInfo.result.account_data.Account,
            privateKey: '', // 보안상 반환하지 않음
            xrp: this.dropsToXrp(accountInfo.result.account_data.Balance)
        };
    }
    /**
     * 트랜잭션 제출
     * @param tx - 트랜잭션 객체
     * @param wallet - 서명할 지갑
     * @returns 제출 결과
     */
    async submitTransaction(tx, wallet) {
        try {
            // 계정 정보 조회 (Sequence 번호 가져오기)
            const accountInfo = await this.client.request({
                command: 'account_info',
                account: wallet.address
            });
            const sequence = accountInfo.result.account_data.Sequence;
            // LastLedgerSequence 설정 (현재 ledger + 4)
            const serverInfo = await this.client.request({ command: 'server_info' });
            const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
            const lastLedgerSequence = currentLedger + 4;
            // 트랜잭션에 필수 필드 추가
            const txWithRequiredFields = {
                ...tx,
                Sequence: sequence,
                LastLedgerSequence: lastLedgerSequence,
                Fee: '12' // 기본 수수료 (12 drops)
            };
            // 트랜잭션 서명
            const signedTx = wallet.sign(txWithRequiredFields);
            // 트랜잭션 제출
            const result = await this.client.submitAndWait(signedTx.tx_blob);
            if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
                const meta = result.result.meta;
                if (meta.TransactionResult === 'tesSUCCESS') {
                    return {
                        success: true,
                        hash: result.result.hash,
                        result: result.result
                    };
                }
                else {
                    throw new Error(`Transaction failed: ${meta.TransactionResult}`);
                }
            }
            else {
                throw new Error('Invalid transaction result format');
            }
        }
        catch (error) {
            console.error('Transaction submission failed:', error);
            throw error;
        }
    }
    /**
     * 모든 발행자 지갑 목록 조회
     * @returns 발행자 지갑 목록
     */
    getAllIssuerWallets() {
        return Array.from(this.issuerWallets.values());
    }
    /**
     * 프로젝트 발행자 지갑 비활성화
     * @param projectId - 프로젝트 ID
     */
    deactivateIssuerWallet(projectId) {
        const issuerData = this.issuerWallets.get(projectId);
        if (issuerData) {
            issuerData.isActive = false;
            this.issuerWallets.set(projectId, issuerData);
        }
    }
    /**
     * 지갑 유효성 검증
     * @param wallet - 검증할 지갑
     * @returns 검증 결과
     */
    validateWallet(wallet) {
        const errors = [];
        if (!wallet.address) {
            errors.push('Wallet address is required');
        }
        if (!wallet.publicKey) {
            errors.push('Wallet public key is required');
        }
        if (!wallet.privateKey) {
            errors.push('Wallet private key is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * XRP를 드롭으로 변환
     * @param xrp - XRP 양
     * @returns 드롭 양
     */
    xrpToDrops(xrp) {
        return (parseFloat(xrp) * 1000000).toString();
    }
    /**
     * 드롭을 XRP로 변환
     * @param drops - 드롭 양
     * @returns XRP 양
     */
    dropsToXrp(drops) {
        return (parseFloat(drops) / 1000000).toString();
    }
    /**
     * 지갑 통계 조회
     * @returns 지갑 통계
     */
    getWalletStats() {
        const allWallets = this.getAllIssuerWallets();
        return {
            total: allWallets.length,
            active: allWallets.filter(w => w.isActive).length,
            inactive: allWallets.filter(w => !w.isActive).length
        };
    }
    /**
     * 특정 프로젝트의 발행자 지갑 존재 여부 확인
     * @param projectId - 프로젝트 ID
     * @returns 존재 여부
     */
    hasIssuerWallet(projectId) {
        return this.issuerWallets.has(projectId);
    }
    /**
     * 발행자 지갑 활성화 상태 확인
     * @param projectId - 프로젝트 ID
     * @returns 활성화 여부
     */
    isIssuerWalletActive(projectId) {
        const issuerData = this.issuerWallets.get(projectId);
        return issuerData ? issuerData.isActive : false;
    }
}
exports.WalletManager = WalletManager;
