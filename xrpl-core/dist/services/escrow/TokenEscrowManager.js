"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenEscrowManager = void 0;
const xrpl_1 = require("xrpl");
const constants_1 = require("../../config/constants");
const crypto = __importStar(require("crypto"));
const cc = __importStar(require("five-bells-condition"));
/**
 * 토큰 에스크로 관리 서비스
 * 투자금을 조건부로 보관하고 마일스톤 달성 시 해제
 */
class TokenEscrowManager {
    constructor(xrplClient) {
        this.escrows = new Map();
        this.client = xrplClient;
    }
    /**
     * 투자금 에스크로 생성
     * @param escrowData - 에스크로 데이터
     * @returns 에스크로 생성 결과
     */
    async createInvestmentEscrow(escrowData) {
        try {
            // 1. 크립토 조건 생성 (마일스톤 기반)
            const condition = this.generateCryptoCondition(escrowData.milestoneId || 'default');
            // 2. 에스크로 생성 트랜잭션 구성 (최신 API)
            const escrowTx = {
                TransactionType: "EscrowCreate",
                Account: escrowData.investorAddress,
                Destination: escrowData.projectWallet || escrowData.investorAddress,
                Amount: this.xrpToDrops(escrowData.rlusdAmount.toString()),
                Condition: condition.conditionHex,
                FinishAfter: this.dateToRippleTime(escrowData.deadline)
            };
            // 3. 트랜잭션 검증
            this.validateEscrowTransaction(escrowTx);
            // 4. 투자자 지갑으로 서명 및 제출
            const investorWallet = xrpl_1.Wallet.fromSeed(escrowData.investorSeed || '');
            const result = await this.submitTransaction(escrowTx, investorWallet);
            if (result.success) {
                // 5. 에스크로 데이터 저장
                const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const savedEscrow = {
                    ...escrowData,
                    id: escrowId,
                    condition: condition.conditionHex,
                    fulfillment: condition.fulfillmentHex,
                    escrowSequence: result.sequence,
                    status: constants_1.ESCROW_STATUS['ACTIVE'],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.escrows.set(escrowId, savedEscrow);
                console.log(`✅ Investment escrow created: ${escrowId}`);
                return {
                    success: true,
                    escrowId,
                    txHash: result.hash,
                    escrowSequence: result.sequence,
                    condition: condition.conditionHex,
                    fulfillment: condition.fulfillmentHex
                };
            }
            else {
                throw new Error('Failed to create escrow transaction');
            }
        }
        catch (error) {
            console.error('❌ Escrow creation failed:', error);
            return {
                success: false,
                message: `Escrow creation failed: ${error.message}`
            };
        }
    }
    /**
     * 에스크로 해제 (마일스톤 달성 시)
     * @param escrowId - 에스크로 ID
     * @param milestoneEvidence - 마일스톤 달성 증거
     * @returns 에스크로 해제 결과
     */
    async releaseEscrow(escrowId, milestoneEvidence) {
        try {
            const escrowData = this.escrows.get(escrowId);
            if (!escrowData) {
                throw new Error(`Escrow not found: ${escrowId}`);
            }
            // 1. 마일스톤 검증
            const isValidMilestone = await this.verifyMilestoneAchievement(escrowData, milestoneEvidence);
            if (!isValidMilestone) {
                throw new Error('Milestone verification failed');
            }
            // 2. 에스크로 해제 트랜잭션 구성
            const finishTx = {
                TransactionType: constants_1.TRANSACTION_TYPES.ESCROW_FINISH,
                Account: escrowData.investorAddress,
                Owner: escrowData.investorAddress,
                OfferSequence: escrowData.escrowSequence,
                Condition: escrowData.condition,
                Fulfillment: escrowData.fulfillment,
                Fee: '12'
            };
            // 3. 트랜잭션 검증
            this.validateEscrowFinishTransaction(finishTx);
            // 4. 투자자 지갑으로 서명 및 제출
            const investorWallet = xrpl_1.Wallet.fromSeed(escrowData.investorSeed || '');
            const result = await this.submitTransaction(finishTx, investorWallet);
            if (result.success) {
                // 5. 에스크로 상태 업데이트
                escrowData.status = constants_1.ESCROW_STATUS['FINISHED'];
                escrowData.updatedAt = new Date();
                this.escrows.set(escrowId, escrowData);
                console.log(`✅ Escrow released: ${escrowId}`);
                return {
                    success: true,
                    message: 'Escrow successfully released',
                    txHash: result.hash
                };
            }
            else {
                throw new Error('Failed to release escrow');
            }
        }
        catch (error) {
            console.error('❌ Escrow release failed:', error);
            return {
                success: false,
                message: `Escrow release failed: ${error.message}`
            };
        }
    }
    /**
     * 에스크로 취소 (시간 초과 또는 프로젝트 실패 시)
     * @param escrowId - 에스크로 ID
     * @param reason - 취소 사유
     * @returns 에스크로 취소 결과
     */
    async cancelEscrow(escrowId, reason) {
        try {
            const escrowData = this.escrows.get(escrowId);
            if (!escrowData) {
                throw new Error(`Escrow not found: ${escrowId}`);
            }
            // 1. 에스크로 취소 트랜잭션 구성
            const cancelTx = {
                TransactionType: constants_1.TRANSACTION_TYPES.ESCROW_CANCEL,
                Account: escrowData.investorAddress,
                Owner: escrowData.investorAddress,
                OfferSequence: escrowData.escrowSequence,
                Fee: '12'
            };
            // 2. 투자자 지갑으로 서명 및 제출
            const investorWallet = xrpl_1.Wallet.fromSeed(escrowData.investorSeed || '');
            const result = await this.submitTransaction(cancelTx, investorWallet);
            if (result.success) {
                // 3. 에스크로 상태 업데이트
                escrowData.status = constants_1.ESCROW_STATUS['CANCELLED'];
                escrowData.updatedAt = new Date();
                this.escrows.set(escrowId, escrowData);
                console.log(`✅ Escrow cancelled: ${escrowId} - ${reason}`);
                return {
                    success: true,
                    message: `Escrow cancelled: ${reason}`,
                    txHash: result.hash
                };
            }
            else {
                throw new Error('Failed to cancel escrow');
            }
        }
        catch (error) {
            console.error('❌ Escrow cancellation failed:', error);
            return {
                success: false,
                message: `Escrow cancellation failed: ${error.message}`
            };
        }
    }
    /**
     * 에스크로 정보 조회
     * @param escrowId - 에스크로 ID
     * @returns 에스크로 데이터
     */
    getEscrow(escrowId) {
        return this.escrows.get(escrowId);
    }
    /**
     * 프로젝트별 에스크로 목록 조회
     * @param projectId - 프로젝트 ID
     * @returns 에스크로 목록
     */
    getEscrowsByProject(projectId) {
        return Array.from(this.escrows.values()).filter(escrow => escrow.projectId === projectId);
    }
    /**
     * 크립토 조건 생성 (공식 예시 기반)
     * @param milestoneId - 마일스톤 ID
     * @returns 크립토 조건과 fulfillment
     */
    generateCryptoCondition(_milestoneId) {
        // 공식 예시와 동일한 방식
        const preimageData = crypto.randomBytes(32);
        const myFulfillment = new cc.PreimageSha256();
        myFulfillment.setPreimage(preimageData);
        const conditionHex = myFulfillment.getConditionBinary().toString('hex').toUpperCase();
        return {
            conditionHex,
            fulfillmentHex: myFulfillment.serializeBinary().toString('hex').toUpperCase()
        };
    }
    /**
     * 마일스톤 달성 검증
     * @param escrowData - 에스크로 데이터
     * @param evidence - 달성 증거
     * @returns 검증 결과
     */
    async verifyMilestoneAchievement(_escrowData, evidence) {
        // 실제 구현에서는 더 정교한 검증 로직 필요
        // 예: GitHub 커밋 확인, 외부 API 검증, 전문가 검토 등
        if (!evidence || !evidence.type) {
            return false;
        }
        switch (evidence.type) {
            case 'github_repository':
                return this.verifyGitHubEvidence(evidence);
            case 'external_verification':
                return this.verifyExternalEvidence(evidence);
            case 'manual_approval':
                return this.verifyManualApproval(evidence);
            default:
                return false;
        }
    }
    /**
     * GitHub 증거 검증
     * @param evidence - GitHub 증거
     * @returns 검증 결과
     */
    async verifyGitHubEvidence(evidence) {
        // 실제 구현에서는 GitHub API를 통해 커밋, PR, 이슈 등을 검증
        console.log(`🔍 Verifying GitHub evidence: ${evidence.url}`);
        return true; // 임시로 항상 성공
    }
    /**
     * 외부 검증 서비스 증거 검증
     * @param evidence - 외부 증거
     * @returns 검증 결과
     */
    async verifyExternalEvidence(evidence) {
        // 실제 구현에서는 외부 검증 서비스 API 호출
        console.log(`🔍 Verifying external evidence: ${evidence.service}`);
        return true; // 임시로 항상 성공
    }
    /**
     * 수동 승인 검증
     * @param evidence - 수동 승인 증거
     * @returns 검증 결과
     */
    async verifyManualApproval(evidence) {
        // 실제 구현에서는 관리자 승인 시스템과 연동
        console.log(`🔍 Verifying manual approval: ${evidence.approverId}`);
        return true; // 임시로 항상 성공
    }
    /**
     * 에스크로 트랜잭션 검증
     * @param tx - 트랜잭션 데이터
     */
    validateEscrowTransaction(tx) {
        if (!tx.Account || !tx.Destination || !tx.Amount) {
            throw new Error('Invalid escrow transaction: missing required fields');
        }
    }
    /**
     * 에스크로 해제 트랜잭션 검증
     * @param tx - 트랜잭션 데이터
     */
    validateEscrowFinishTransaction(tx) {
        if (!tx.Account || !tx.Owner || !tx.OfferSequence) {
            throw new Error('Invalid escrow finish transaction: missing required fields');
        }
    }
    /**
     * 트랜잭션 제출
     * @param tx - 트랜잭션 데이터
     * @param wallet - 서명할 지갑
     * @returns 제출 결과
     */
    async submitTransaction(tx, wallet) {
        try {
            const signedTx = wallet.sign(tx);
            const result = await this.client.submitAndWait(signedTx.tx_blob);
            if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
                const meta = result.result.meta;
                if (meta.TransactionResult === 'tesSUCCESS') {
                    return {
                        success: true,
                        hash: result.result.hash,
                        sequence: result.result.tx_json?.Sequence || 0,
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
     * XRP를 드롭으로 변환
     * @param xrp - XRP 양
     * @returns 드롭 양
     */
    xrpToDrops(xrp) {
        return (parseFloat(xrp) * 1000000).toString();
    }
    /**
     * 날짜를 Ripple 시간으로 변환
     * @param date - 날짜
     * @returns Ripple 시간
     */
    dateToRippleTime(date) {
        return Math.floor(date.getTime() / 1000) + 946684800; // Unix epoch + Ripple epoch offset
    }
}
exports.TokenEscrowManager = TokenEscrowManager;
//# sourceMappingURL=TokenEscrowManager.js.map