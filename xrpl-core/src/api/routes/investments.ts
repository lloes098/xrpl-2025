import { Router, Request, Response } from 'express';
import { Client, Wallet } from 'xrpl';
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
 * 투자 목록 조회
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const allProjects = projectManager.getAllProjects();
    const allInvestments = allProjects.flatMap(project => 
      projectManager.getInvestmentsByProject(project.id)
    );
    
    res.json({
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
  } catch (error) {
    console.error('❌ Get investments failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve investments',
      error: (error as Error).message
    });
  }
});

/**
 * 투자 처리
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const {
      projectId,
      investorWallet,
      amount,
      currency = 'RLUSD',
      investmentType = 'equity',
      notes
    } = req.body;

    // 필수 필드 검증
    if (!projectId || !investorWallet || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, investorWallet, amount'
      });
    }

    // 투자자 지갑 생성 (테스트용)
    let investorWalletObj: Wallet;
    if (typeof investorWallet === 'string') {
      // 시드로부터 지갑 복원
      investorWalletObj = Wallet.fromSeed(investorWallet);
    } else {
      // 지갑 객체가 전달된 경우
      investorWalletObj = investorWallet;
    }

    // 투자 처리
    const result = await projectManager.processInvestment({
      projectId,
      investorWallet: investorWalletObj,
      rlusdAmount: parseFloat(amount)
    });

    if (result.success) {
      res.status(201).json({
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
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Investment processing failed'
      });
    }
  } catch (error) {
    console.error('❌ Process investment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process investment',
      error: (error as Error).message
    });
  }
});

/**
 * 특정 투자 조회
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const investmentId = req.params['id'];
    const investment = projectManager.getInvestment(investmentId);
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    const project = projectManager.getProject(investment.projectId);
    
    res.json({
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
  } catch (error) {
    console.error('❌ Get investment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve investment',
      error: (error as Error).message
    });
  }
});

/**
 * 프로젝트별 투자 목록 조회
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    await initializeServices();
    
    const projectId = req.params['projectId'];
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
  } catch (error) {
    console.error('❌ Get project investments failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project investments',
      error: (error as Error).message
    });
  }
});

export default router;
