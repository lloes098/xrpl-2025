"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ServiceContainer_1 = require("../../services/ServiceContainer");
const router = (0, express_1.Router)();
const serviceContainer = ServiceContainer_1.ServiceContainer.getInstance();
/**
 * 프로젝트 목록 조회
 */
router.get('/', async (_req, res) => {
    try {
        await serviceContainer.initialize();
        const projects = serviceContainer.projectManager.getAllProjects();
        const activeProjects = serviceContainer.projectManager.getActiveProjects();
        res.json({
            success: true,
            message: 'Projects retrieved successfully',
            data: {
                total: projects.length,
                active: activeProjects.length,
                projects: projects.map(project => ({
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    targetAmount: project.targetAmount,
                    currentAmount: project.currentAmount,
                    progress: Math.round((project.currentAmount / project.targetAmount) * 100),
                    status: project.status,
                    deadline: project.deadline,
                    investorCount: project.investors.size,
                    mptIssuanceId: project.mptData?.mptIssuanceId,
                    website: project.website,
                    logo: project.logo,
                    category: project.category,
                    tags: project.tags,
                    createdAt: project.createdAt
                }))
            }
        });
    }
    catch (error) {
        console.error('❌ Get projects failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects',
            error: error.message
        });
    }
});
/**
 * 프로젝트 생성
 */
router.post('/', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const { name, description, targetAmount, deadline, creatorWallet, website, logo, category, tags, socialLinks, tokenomics, milestones } = req.body;
        // 필수 필드 검증
        if (!name || !description || !targetAmount || !deadline || !creatorWallet) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, description, targetAmount, deadline, creatorWallet'
            });
        }
        // 프로젝트 생성
        const result = await serviceContainer.projectManager.createProject({
            name,
            description,
            targetAmount: parseFloat(targetAmount),
            deadline: new Date(deadline),
            creatorWallet,
            website,
            logo,
            category,
            tags,
            socialLinks,
            tokenomics: {
                totalTokens: tokenomics?.totalTokens || 10000000,
                tokenPrice: tokenomics?.tokenPrice || 0.1,
                platformTokenShare: tokenomics?.platformTokenShare || 0.1,
                creatorTokenShare: tokenomics?.creatorTokenShare || 0.2,
                investorTokenShare: tokenomics?.investorTokenShare || 0.7
            },
            milestones: milestones || []
        });
        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: {
                    projectId: result.projectId,
                    mptIssuanceId: result.mptIssuanceId,
                    txHash: result.txHash
                }
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.message || 'Project creation failed'
            });
        }
    }
    catch (error) {
        console.error('❌ Create project failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
});
/**
 * 특정 프로젝트 조회
 */
router.get('/:id', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const projectId = req.params['id'];
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
            message: 'Project retrieved successfully',
            data: {
                id: project.id,
                name: project.name,
                description: project.description,
                targetAmount: project.targetAmount,
                currentAmount: project.currentAmount,
                progress: Math.round((project.currentAmount / project.targetAmount) * 100),
                status: project.status,
                deadline: project.deadline,
                creatorWallet: project.creatorWallet,
                mptData: project.mptData,
                milestones: project.milestones,
                investments: investments.map(inv => ({
                    id: inv.id,
                    investorAddress: inv.investorAddress,
                    amount: inv.amount,
                    tokens: inv.tokens,
                    status: inv.status,
                    createdAt: inv.createdAt
                })),
                website: project.website,
                logo: project.logo,
                category: project.category,
                tags: project.tags,
                socialLinks: project.socialLinks,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            }
        });
    }
    catch (error) {
        console.error('❌ Get project failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve project',
            error: error.message
        });
    }
});
/**
 * 프로젝트 마일스톤 달성
 */
router.post('/:id/milestones/:milestoneId/achieve', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const projectId = req.params['id'];
        const milestoneId = req.params['milestoneId'];
        if (!projectId || !milestoneId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID and Milestone ID are required'
            });
        }
        const { evidence } = req.body;
        if (!evidence) {
            return res.status(400).json({
                success: false,
                message: 'Evidence is required for milestone achievement'
            });
        }
        const result = await serviceContainer.projectManager.achieveMilestone(projectId, milestoneId, evidence);
        if (result.success) {
            return res.json({
                success: true,
                message: 'Milestone achieved successfully',
                data: {
                    projectId,
                    milestoneId,
                    txHash: result.txHash
                }
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.message || 'Milestone achievement failed'
            });
        }
    }
    catch (error) {
        console.error('❌ Achieve milestone failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to achieve milestone',
            error: error.message
        });
    }
});
/**
 * 프로젝트 수익 분배
 */
router.post('/:id/revenue', async (req, res) => {
    try {
        await serviceContainer.initialize();
        const projectId = req.params['id'];
        const { revenueAmount, distributionMethod = 'proportional' } = req.body;
        if (!projectId || !revenueAmount) {
            return res.status(400).json({
                success: false,
                message: 'Project ID and revenue amount are required'
            });
        }
        const project = serviceContainer.projectManager.getProject(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        // 수익 분배 계산
        const platformShare = revenueAmount * 0.1; // 10% 플랫폼 수수료
        const creatorShare = revenueAmount * 0.2; // 20% 창업자
        const investorShare = revenueAmount * 0.7; // 70% 투자자
        // 투자자별 수익 분배
        const investments = serviceContainer.projectManager.getInvestmentsByProject(projectId);
        const totalTokens = investments.reduce((sum, inv) => sum + inv.tokens, 0);
        const investorDistributions = investments.map(investment => ({
            investorAddress: investment.investorAddress,
            tokens: investment.tokens,
            share: (investment.tokens / totalTokens) * investorShare,
            percentage: (investment.tokens / totalTokens) * 100
        }));
        // TODO: 실제 XRPL 트랜잭션으로 수익 분배 실행
        console.log(`Revenue distribution for project ${projectId}:`);
        console.log(`  - Total Revenue: ${revenueAmount} XRP`);
        console.log(`  - Platform Share: ${platformShare} XRP`);
        console.log(`  - Creator Share: ${creatorShare} XRP`);
        console.log(`  - Investor Share: ${investorShare} XRP`);
        return res.json({
            success: true,
            message: 'Revenue distribution completed successfully',
            data: {
                projectId,
                totalRevenue: revenueAmount,
                platformShare,
                creatorShare,
                investorShare,
                investorDistributions,
                distributionMethod
            }
        });
    }
    catch (error) {
        console.error('❌ Revenue distribution failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to distribute revenue',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map