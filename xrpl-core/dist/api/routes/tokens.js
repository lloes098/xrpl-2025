"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MPTokenManager_1 = require("../../services/mpt/MPTokenManager");
const router = express_1.default.Router();
/**
 * MPT 토큰 발행
 * POST /api/tokens/mpt/create
 */
router.post('/mpt/create', async (req, res) => {
    try {
        const { adminSeed, userSeed, assetScale, maximumAmount, metadata } = req.body;
        if (!adminSeed || !userSeed) {
            return res.status(400).json({
                success: false,
                error: 'adminSeed와 userSeed가 필요합니다.'
            });
        }
        const result = await (0, MPTokenManager_1.createMPToken)(adminSeed, userSeed, assetScale || 0, maximumAmount || "1000000000", metadata);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('MPT 생성 실패:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'MPT 생성 실패'
        });
    }
});
/**
 * MPT 토큰 옵트인
 * POST /api/tokens/mpt/optin
 */
router.post('/mpt/optin', async (req, res) => {
    try {
        const { userSeed, issuanceId } = req.body;
        if (!userSeed || !issuanceId) {
            return res.status(400).json({
                success: false,
                error: 'userSeed와 issuanceId가 필요합니다.'
            });
        }
        const result = await (0, MPTokenManager_1.optInMPToken)(userSeed, issuanceId);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('MPT 옵트인 실패:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'MPT 옵트인 실패'
        });
    }
});
/**
 * MPT 토큰 전송
 * POST /api/tokens/mpt/send
 */
router.post('/mpt/send', async (req, res) => {
    try {
        const { adminSeed, userSeed, issuanceId, destinationAddress, amount, fromAdmin } = req.body;
        if (!adminSeed || !userSeed || !issuanceId || !destinationAddress || !amount) {
            return res.status(400).json({
                success: false,
                error: '모든 필수 필드가 필요합니다.'
            });
        }
        const result = await (0, MPTokenManager_1.sendMPToken)(adminSeed, userSeed, issuanceId, destinationAddress, amount, fromAdmin || true);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('MPT 전송 실패:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'MPT 전송 실패'
        });
    }
});
/**
 * MPT 토큰 권한 부여/해제
 * POST /api/tokens/mpt/authorize
 */
router.post('/mpt/authorize', async (req, res) => {
    try {
        const { adminSeed, issuanceId, holderAddress, isUnauthorize } = req.body;
        if (!adminSeed || !issuanceId || !holderAddress) {
            return res.status(400).json({
                success: false,
                error: 'adminSeed, issuanceId, holderAddress가 필요합니다.'
            });
        }
        const result = await (0, MPTokenManager_1.authorizeMPToken)(adminSeed, issuanceId, holderAddress, isUnauthorize || false);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('MPT 권한 부여 실패:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'MPT 권한 부여 실패'
        });
    }
});
/**
 * MPT 토큰 소각
 * DELETE /api/tokens/mpt/:issuanceId
 */
router.delete('/mpt/:issuanceId', async (req, res) => {
    try {
        const { issuanceId } = req.params;
        const { adminSeed } = req.body;
        if (!adminSeed) {
            return res.status(400).json({
                success: false,
                error: 'adminSeed가 필요합니다.'
            });
        }
        const result = await (0, MPTokenManager_1.destroyMPToken)(adminSeed, issuanceId);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('MPT 소각 실패:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'MPT 소각 실패'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tokens.js.map