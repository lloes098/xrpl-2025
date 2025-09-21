"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xrpl_1 = require("xrpl");
const ServiceContainer_1 = require("../../services/ServiceContainer");
const router = (0, express_1.Router)();
const serviceContainer = ServiceContainer_1.ServiceContainer.getInstance();
/**
 * 투자 목록 조회
 */
router.get('/', async (_req, res) => {
    try {
        await serviceContainer.initialize();
        const allProjects = serviceContainer.projectManager.getAllProjects();
        const allInvestments = allProjects.flatMap(project => serviceContainer.projectManager.getInvestmentsByProject(project.id));
        return res.json({
            success: true,
            message: 'Investments retrieved successfully',
            data: {
                total: allInvestments.length,
                investments: allInvestments.map(investment => ({
                    id: investment.id,
                    projectId: investment.projectId,
                    investorAddress: investment.investorAddress,
                    amount: investment.amount,
                    tokens: investment.tokens,
                    status: investment.status,
                    txHash: investment.txHash,
                    createdAt: investment.createdAt,
                    updatedAt: investment.updatedAt
                }))
            }
        });
    }
    catch (error) {
        console.error('❌ Get investments failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve investments',
            error: error.message
        });
    }
});
/**
 * 투자 처리
 */
router.post('/', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const { projectId, investorWallet, amount, currency = 'RLUSD', investmentType = 'equity', notes } = req.body;
        // 필수 필드 검증
        if (!projectId || !investorWallet || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: projectId, investorWallet, amount'
            });
        }
        // 투자자 지갑 생성 (테스트용)
        let investorWalletObj;
        if (typeof investorWallet === 'string') {
            // 시드로부터 지갑 복원
            investorWalletObj = xrpl_1.Wallet.fromSeed(investorWallet);
        }
        else {
            // 지갑 객체가 전달된 경우
            investorWalletObj = investorWallet;
        }
        // 투자 처리
        const result = await serviceContainer.projectManager.processInvestment({
            projectId,
            investorWallet: investorWalletObj,
            xrpAmount: parseFloat(amount)
        });
        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Investment processed successfully',
                data: {
                    investmentId: result.investmentId,
                    txHash: result.txHash,
                    tokensReceived: result.tokensReceived,
                    amount: parseFloat(amount),
                    currency,
                    investmentType,
                    notes
                }
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.message || 'Investment processing failed'
            });
        }
    }
    catch (error) {
        console.error('❌ Process investment failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process investment',
            error: error.message
        });
    }
});
/**
 * 특정 투자 조회
 */
router.get('/:id', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const investmentId = req.params['id'];
        if (!investmentId) {
            return res.status(400).json({
                success: false,
                message: 'Investment ID is required'
            });
        }
        const investment = serviceContainer.projectManager.getInvestment(investmentId);
        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }
        const project = serviceContainer.projectManager.getProject(investment.projectId);
        return res.json({
            success: true,
            message: 'Investment retrieved successfully',
            data: {
                id: investment.id,
                projectId: investment.projectId,
                projectName: project?.name || 'Unknown Project',
                investorAddress: investment.investorAddress,
                amount: investment.amount,
                tokens: investment.tokens,
                status: investment.status,
                txHash: investment.txHash,
                createdAt: investment.createdAt,
                updatedAt: investment.updatedAt
            }
        });
    }
    catch (error) {
        console.error('❌ Get investment failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve investment',
            error: error.message
        });
    }
});
/**
 * 프로젝트별 투자 목록 조회
 */
router.get('/project/:projectId', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const projectId = req.params['projectId'];
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }
        const project = serviceContainer.projectManager.getProject(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        const investments = serviceContainer.projectManager.getInvestmentsByProject(projectId);
        return res.json({
            success: true,
            message: 'Project investments retrieved successfully',
            data: {
                projectId,
                projectName: project.name,
                totalInvestments: investments.length,
                totalAmount: investments.reduce((sum, inv) => sum + inv.amount, 0),
                totalTokens: investments.reduce((sum, inv) => sum + inv.tokens, 0),
                investments: investments.map(investment => ({
                    id: investment.id,
                    investorAddress: investment.investorAddress,
                    amount: investment.amount,
                    tokens: investment.tokens,
                    status: investment.status,
                    txHash: investment.txHash,
                    createdAt: investment.createdAt
                }))
            }
        });
    }
    catch (error) {
        console.error('❌ Get project investments failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve project investments',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=investments.js.map