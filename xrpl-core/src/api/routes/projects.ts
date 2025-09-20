import { Router, Request, Response } from 'express';
import { Client } from 'xrpl';
import { MPTManager } from '../../services/mpt/MPTManager';
import { TokenEscrowManager } from '../../services/escrow/TokenEscrowManager';
import { BatchManager } from '../../services/batch/BatchManager';
import { WalletManager } from '../../services/wallet/WalletManager';
import { ProjectManager } from '../../services/project/ProjectManager';
import testData from '../../test-data/frontend-simulation.json';

const router = Router();

// XRPL 클라이언트 및 서비스 초기화
let xrplClient: Client;
let projectManager: ProjectManager;
let isInitialized = false;

// 서비스 초기화
async function initializeServices() {
  if (isInitialized) return;

  try {
    // XRPL 클라이언트 연결 (테스트넷)
    xrplClient = new Client('wss://s.altnet.rippletest.net:51233');
    await xrplClient.connect();
    console.log('✅ XRPL Client connected to testnet');

    // 서비스들 초기화
    const walletManager = new WalletManager(xrplClient);
    const mptManager = new MPTManager(xrplClient, walletManager);
    const escrowManager = new TokenEscrowManager(xrplClient);
    const batchManager = new BatchManager(xrplClient);
    
    projectManager = new ProjectManager(
      xrplClient,
      mptManager,
      escrowManager,
      batchManager,
      walletManager
    );

    // 플랫폼 마스터 지갑 초기화
    await walletManager.initializePlatformWallet(
      testData.testWallets.platform.seed
    );

    isInitialized = true;
    console.log('✅ All services initialized');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    throw error;
  }
}

/**
 * 프로젝트 목록 조회
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const projects = projectManager.getAllProjects();
    const activeProjects = projectManager.getActiveProjects();
    
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
  } catch (error) {
    console.error('❌ Get projects failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects',
      error: (error as Error).message
    });
  }
});

/**
 * 프로젝트 생성
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const {
      name,
      description,
      targetAmount,
      deadline,
      creatorWallet,
      website,
      logo,
      category,
      tags,
      socialLinks,
      tokenomics,
      milestones
    } = req.body;

    // 필수 필드 검증
    if (!name || !description || !targetAmount || !deadline || !creatorWallet) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, targetAmount, deadline, creatorWallet'
      });
    }

    // 프로젝트 생성
    const result = await projectManager.createProject({
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
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Project creation failed'
      });
    }
  } catch (error) {
    console.error('❌ Create project failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: (error as Error).message
    });
  }
});

/**
 * 특정 프로젝트 조회
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const projectId = req.params['id'];
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }
    const project = projectManager.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const investments = projectManager.getInvestmentsByProject(projectId);
    
    res.json({
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
  } catch (error) {
    console.error('❌ Get project failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
      error: (error as Error).message
    });
  }
});

/**
 * 프로젝트 마일스톤 달성
 */
router.post('/:id/milestones/:milestoneId/achieve', async (req: Request, res: Response) => {
  try {
    await initializeServices();
    
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

    const result = await projectManager.achieveMilestone(projectId, milestoneId, evidence);

    if (result.success) {
      res.json({
        success: true,
        message: 'Milestone achieved successfully',
        data: {
          projectId,
          milestoneId,
          txHash: result.txHash
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Milestone achievement failed'
      });
    }
  } catch (error) {
    console.error('❌ Achieve milestone failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to achieve milestone',
      error: (error as Error).message
    });
  }
});

export default router;
