"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
/**
 * 에스크로 목록 조회
 */
router.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Escrows endpoint - coming soon',
        data: []
    });
});
/**
 * 에스크로 생성
 */
router.post('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Escrow creation - coming soon',
        data: null
    });
});
/**
 * 특정 에스크로 조회
 */
router.get('/:id', (req, res) => {
    res.json({
        success: true,
        message: 'Escrow details - coming soon',
        data: { id: req.params['id'] }
    });
});
exports.default = router;
//# sourceMappingURL=escrows.js.map