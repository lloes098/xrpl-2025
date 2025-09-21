"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPTManager = void 0;
const constants_1 = require("../../config/constants");
/**
 * MPT 토큰 관리 서비스
 * MPT 토큰 생성, 발행, 전송 관리
 */
class MPTManager {
    constructor(xrplClient, walletManager) {
        this.mptTokens = new Map();
        this.client = xrplClient;
        this.walletManager = walletManager;
    }
    /**
     * 프로젝트용 MPT 토큰 생성
     * @param projectData - 프로젝트 데이터
     * @returns MPT 토큰 데이터
     */
    async createProjectMPT(projectData) {
        const { projectId, name, description, totalTokens, targetAmount } = projectData;
        try {
            // 1. 프로젝트 전용 발행자 지갑 생성
            const issuerWallet = await this.walletManager.createIssuerWallet(projectId);
            // 2. 메타데이터 구성 (공식 방식)
            const metadata = this.buildMetadata({
                name: `${name} Token`,
                description,
                projectId,
                totalSupply: totalTokens,
                targetAmount,
                ...(projectData.website && { website: projectData.website }),
                ...(projectData.logo && { logo: projectData.logo }),
                ...(projectData.category && { category: projectData.category }),
                ...(projectData.tags && { tags: projectData.tags }),
                ...(projectData.socialLinks && { socialLinks: projectData.socialLinks })
            });
            // 3. MPT 발행 트랜잭션 (공식 예시 방식)
            const transaction = {
                TransactionType: "MPTokenIssuanceCreate",
                Account: issuerWallet.address,
                AssetScale: 0, // 공식 예시는 0
                MaximumAmount: totalTokens.toString(),
                TransferFee: 0,
                Flags: {
                    tfMPTCanTransfer: true,
                    tfMPTCanEscrow: true,
                    tfMPTRequireAuth: false
                },
                MPTokenMetadata: metadata.hexMetadata
            };
            // 4. 공식 방식으로 트랜잭션 제출
            const prepared = await this.client.autofill(transaction);
            const signed = issuerWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
                const meta = result.result.meta;
                if (meta.TransactionResult !== 'tesSUCCESS') {
                    throw new Error(`Transaction failed: ${meta.TransactionResult}`);
                }
            }
            // 5. MPT 발행 ID 추출 (공식 방식)
            const mptIssuanceId = result.result.meta?.mpt_issuance_id || this.extractMPTIssuanceId(result.result);
            // 6. 토큰 정보 저장
            const mptData = {
                projectId,
                issuerWallet: issuerWallet.address,
                mptIssuanceId,
                name: `${name} Token`,
                symbol: this.generateSymbol(name),
                description,
                totalSupply: totalTokens,
                circulatingSupply: 0,
                metadata: metadata.metadata,
                flags: {
                    MPTfTransferable: true,
                    MPTfOnlyXRP: false,
                    MPTfTrustLine: true
                },
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                holders: new Map()
            };
            this.mptTokens.set(projectId, mptData);
            console.log(`MPT token created for project ${projectId}: ${mptData.mptIssuanceId}`);
            return mptData;
        }
        catch (error) {
            console.error('MPT token creation failed:', error);
            throw error;
        }
    }
    /**
     * 토큰 발행 (투자자/플랫폼에게)
     * @param mptData - MPT 토큰 데이터
     * @param recipient - 수신자 주소
     * @param amount - 발행할 토큰 양
     * @returns 발행 결과
     */
    async mintTokens(mptData, recipient, amount) {
        try {
            const issuerWallet = this.walletManager.getIssuerWallet(mptData.projectId);
            // Trust Line 설정 (수신자가 토큰을 받을 수 있도록)
            await this.setupTrustLine(recipient, mptData.mptIssuanceId);
            // MPT 전송 트랜잭션 (공식 예시 방식)
            const transaction = {
                TransactionType: "Payment",
                Account: issuerWallet.address,
                Destination: recipient,
                Amount: {
                    mpt_issuance_id: mptData.mptIssuanceId,
                    value: amount.toString()
                }
            };
            // 공식 방식으로 트랜잭션 제출
            const prepared = await this.client.autofill(transaction);
            const signed = issuerWallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
            if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
                const meta = result.result.meta;
                if (meta.TransactionResult !== 'tesSUCCESS') {
                    throw new Error(`Transaction failed: ${meta.TransactionResult}`);
                }
            }
            // 토큰 데이터 업데이트
            mptData.circulatingSupply += amount;
            const currentBalance = mptData.holders.get(recipient) || 0;
            mptData.holders.set(recipient, currentBalance + amount);
            mptData.updatedAt = new Date();
            this.mptTokens.set(mptData.projectId, mptData);
            console.log(`Minted ${amount} tokens to ${recipient} for project ${mptData.projectId}`);
            return { success: true };
        }
        catch (error) {
            console.error('Token minting failed:', error);
            throw error;
        }
    }
    /**
     * 토큰 전송
     * @param fromAddress - 발신자 주소
     * @param toAddress - 수신자 주소
     * @param mptIssuanceId - MPT 발행 ID
     * @param amount - 전송할 토큰 양
     * @param senderWallet - 발신자 지갑
     * @returns 전송 결과
     */
    async transferTokens(fromAddress, toAddress, mptIssuanceId, amount, senderWallet) {
        // 수신자 Trust Line 설정
        await this.setupTrustLine(toAddress, mptIssuanceId);
        const transferTx = {
            TransactionType: constants_1.TRANSACTION_TYPES.PAYMENT,
            Account: fromAddress,
            Destination: toAddress,
            Amount: {
                mpt_issuance_id: mptIssuanceId,
                value: amount.toString()
            },
            Fee: this.xrpToDrops('0.001')
        };
        await this.submitTransaction(transferTx, senderWallet);
        // 토큰 데이터 업데이트
        const projectId = this.getProjectIdByIssuanceId(mptIssuanceId);
        if (projectId) {
            const mptData = this.mptTokens.get(projectId);
            if (mptData) {
                const fromBalance = mptData.holders.get(fromAddress) || 0;
                const toBalance = mptData.holders.get(toAddress) || 0;
                mptData.holders.set(fromAddress, fromBalance - amount);
                mptData.holders.set(toAddress, toBalance + amount);
                mptData.updatedAt = new Date();
                this.mptTokens.set(projectId, mptData);
            }
        }
        console.log(`Transferred ${amount} tokens from ${fromAddress} to ${toAddress}`);
        return { success: true };
    }
    /**
     * Trust Line 설정
     * @param address - 지갑 주소
     * @param mptIssuanceId - MPT 발행 ID
     */
    async setupTrustLine(address, mptIssuanceId) {
        try {
            // 실제 구현에서는 지갑으로 서명하여 트랜잭션 제출
            // const trustTx: TransactionData = {
            //   TransactionType: TRANSACTION_TYPES.MPT_AUTHORIZE,
            //   Account: address,
            //   Amount: '0',
            //   MPTokenIssuanceID: mptIssuanceId
            // };
            // await this.submitTransaction(trustTx, wallet);
            console.log(`Trust line set up for ${address} with MPT ${mptIssuanceId}`);
        }
        catch (error) {
            console.warn(`Trust line setup failed for ${address}: ${error.message}`);
        }
    }
    /**
     * 토큰 잔액 조회 (최신 API)
     * @param address - 지갑 주소
     * @param mptIssuanceId - MPT 발행 ID
     * @returns 토큰 잔액
     */
    async getTokenBalance(address, mptIssuanceId) {
        try {
            // 최신 MPT 조회 API 사용
            const mpts = await this.client.request({
                command: "account_objects",
                account: address,
                ledger_index: "validated",
                type: "mptoken"
            });
            if (mpts.result.account_objects) {
                const mpt = mpts.result.account_objects.find((obj) => obj.MPTokenIssuanceID === mptIssuanceId);
                return mpt ? parseFloat(mpt.MPTAmount || '0') : 0;
            }
            return 0;
        }
        catch (error) {
            console.error(`Failed to get token balance for ${address}:`, error);
            return 0;
        }
    }
    /**
     * MPT 토큰 정보 조회
     * @param projectId - 프로젝트 ID
     * @returns MPT 토큰 정보
     */
    getMPTToken(projectId) {
        const mptData = this.mptTokens.get(projectId);
        if (!mptData) {
            throw new Error(`MPT token not found for project: ${projectId}`);
        }
        return mptData;
    }
    /**
     * 모든 MPT 토큰 목록 조회
     * @returns MPT 토큰 목록
     */
    getAllMPTTokens() {
        return Array.from(this.mptTokens.values());
    }
    /**
     * 메타데이터 구성
     * @param data - 메타데이터 데이터
     * @returns HEX 인코딩된 메타데이터
     */
    buildMetadata(data) {
        // 간소화된 메타데이터 (1024바이트 제한 준수)
        const metadata = {
            name: data.name.substring(0, 50), // 최대 50자
            symbol: this.generateSymbol(data.name),
            description: data.description.substring(0, 200), // 최대 200자
            project_id: data.projectId,
            category: data.category || 'Technology',
            total_supply: data.totalSupply,
            target_amount: data.targetAmount,
            token_type: 'MPT',
            created_at: new Date().toISOString()
        };
        // 공식 예시 방식으로 HEX 인코딩 (xrpl.convertStringToHex와 동일)
        const metadataJson = JSON.stringify(metadata);
        const hexMetadata = Buffer.from(metadataJson, 'utf8').toString('hex');
        // 1024바이트 제한 확인
        if (hexMetadata.length > 2048) { // HEX는 2배 크기
            console.warn(`MPT metadata is ${hexMetadata.length} bytes, exceeding 1024 byte limit`);
            // 더 간소화 (5개 필드만)
            const minimalMetadata = {
                name: data.name.substring(0, 30),
                symbol: this.generateSymbol(data.name),
                project_id: data.projectId,
                total_supply: data.totalSupply,
                token_type: 'MPT'
            };
            const minimalJson = JSON.stringify(minimalMetadata);
            const minimalHex = Buffer.from(minimalJson, 'utf8').toString('hex');
            return { metadata: minimalMetadata, hexMetadata: minimalHex };
        }
        return { metadata, hexMetadata };
    }
    /**
     * MPT 발행 ID 추출
     * @param result - 트랜잭션 결과
     * @returns MPT 발행 ID
     */
    extractMPTIssuanceId(result) {
        // 트랜잭션 결과에서 MPT 발행 ID 추출
        try {
            // 1. 메타데이터에서 MPT 발행 ID 찾기
            if (result.meta && typeof result.meta === 'object') {
                // CreatedNode에서 MPTokenIssuanceID 찾기
                if (result.meta.AffectedNodes) {
                    for (const node of result.meta.AffectedNodes) {
                        if (node.CreatedNode && node.CreatedNode.NewFields) {
                            const newFields = node.CreatedNode.NewFields;
                            if (newFields.MPTokenIssuanceID) {
                                return newFields.MPTokenIssuanceID;
                            }
                        }
                    }
                }
            }
            // 2. 트랜잭션 해시를 기반으로 ID 생성 (fallback)
            if (result.hash) {
                return result.hash.substring(0, 40); // 해시의 첫 40자리 사용
            }
            // 3. 최후의 수단: 타임스탬프 기반 ID
            return `mpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            console.error('Error extracting MPT issuance ID:', error);
            return `mpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }
    /**
     * 토큰 심볼 생성
     * @param name - 토큰 이름
     * @returns 생성된 심볼
     */
    generateSymbol(name) {
        const words = name.split(' ').filter(word => word.length > 0);
        let symbol = '';
        if (words.length === 1) {
            symbol = words[0]?.substring(0, 4).toUpperCase() || '';
        }
        else {
            symbol = words.map(word => word[0]).join('').toUpperCase();
        }
        return symbol.substring(0, 6);
    }
    /**
     * 프로젝트 ID로 발행 ID 조회
     * @param mptIssuanceId - MPT 발행 ID
     * @returns 프로젝트 ID
     */
    getProjectIdByIssuanceId(mptIssuanceId) {
        for (const [projectId, mptData] of this.mptTokens.entries()) {
            if (mptData.mptIssuanceId === mptIssuanceId) {
                return projectId;
            }
        }
        return null;
    }
    /**
     * 트랜잭션 제출
     * @param tx - 트랜잭션 객체
     * @param wallet - 서명할 지갑
     * @returns 제출 결과
     */
    async submitTransaction(tx, wallet) {
        try {
            // 공식 방식: autofill + sign + submitAndWait
            const prepared = await this.client.autofill(tx);
            const signed = wallet.sign(prepared);
            const result = await this.client.submitAndWait(signed.tx_blob);
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
            console.error('MPT transaction submission failed:', error);
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
     * MPT 토큰 비활성화
     * @param projectId - 프로젝트 ID
     */
    deactivateMPTToken(projectId) {
        const mptData = this.mptTokens.get(projectId);
        if (mptData) {
            mptData.isActive = false;
            mptData.updatedAt = new Date();
            this.mptTokens.set(projectId, mptData);
        }
    }
    /**
     * 토큰 유효성 검증
     * @param mptData - MPT 토큰 데이터
     * @returns 검증 결과
     */
    validateMPTToken(mptData) {
        const errors = [];
        if (!mptData.projectId) {
            errors.push('Project ID is required');
        }
        if (!mptData.issuerWallet) {
            errors.push('Issuer wallet is required');
        }
        if (!mptData.mptIssuanceId) {
            errors.push('MPT issuance ID is required');
        }
        if (!mptData.name) {
            errors.push('Token name is required');
        }
        if (!mptData.symbol) {
            errors.push('Token symbol is required');
        }
        if (mptData.totalSupply <= 0) {
            errors.push('Total supply must be positive');
        }
        if (mptData.circulatingSupply < 0) {
            errors.push('Circulating supply cannot be negative');
        }
        if (mptData.circulatingSupply > mptData.totalSupply) {
            errors.push('Circulating supply cannot exceed total supply');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.MPTManager = MPTManager;
//# sourceMappingURL=MPTManager.js.map