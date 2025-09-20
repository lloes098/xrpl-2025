import { Client, Wallet } from 'xrpl';
import { TRANSACTION_TYPES } from '../../config/constants';
import { 
  IssuerWalletData, 
  WalletInfo, 
  TransactionData, 
  ValidationResult 
} from '../../types';

/**
 * 지갑 관리 서비스
 * 프로젝트별 발행자 지갑, 플랫폼 지갑 관리
 */
export class WalletManager {
  private client: Client;
  private issuerWallets: Map<string, IssuerWalletData> = new Map();
  private platformWallet: Wallet | null = null;

  constructor(xrplClient: Client) {
    this.client = xrplClient;
  }

  /**
   * 플랫폼 마스터 지갑 초기화
   * @param masterSeed - 마스터 시드
   */
  async initializePlatformWallet(masterSeed: string): Promise<void> {
    if (!masterSeed) {
      throw new Error('Platform master seed is required');
    }

    this.platformWallet = Wallet.fromSeed(masterSeed);
    
    // 지갑 활성화 확인
    const accountInfo = await this.client.request({
      command: 'account_info',
      account: this.platformWallet.address
    });

    if (accountInfo.result.account_data.Balance === '0') {
      throw new Error('Platform wallet is not funded');
    }

    console.log(`Platform wallet initialized: ${this.platformWallet.address}`);
  }

  /**
   * 프로젝트별 발행자 지갑 생성 (핵심!)
   * @param projectId - 프로젝트 ID
   * @returns 생성된 지갑 정보
   */
  async createIssuerWallet(projectId: string): Promise<Wallet> {
    const wallet = Wallet.generate();

    // 발행자 지갑 활성화을 위한 XRP 전송
    await this.fundWalletFromPlatform(wallet.address, '10'); // 10 XRP

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
  async fundWalletFromPlatform(destinationAddress: string, amount: string): Promise<any> {
    if (!this.platformWallet) {
      throw new Error('Platform wallet not initialized');
    }

    const tx: TransactionData = {
      TransactionType: TRANSACTION_TYPES.PAYMENT,
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
  async setupTrustLine(wallet: Wallet, mptIssuanceId: string): Promise<any> {
    const tx: TransactionData = {
      TransactionType: TRANSACTION_TYPES.MPT_AUTHORIZE,
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
  getIssuerWallet(projectId: string): Wallet {
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
  getPlatformWallet(): Wallet {
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
  async getWalletBalance(address: string): Promise<WalletInfo> {
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
  async submitTransaction(tx: TransactionData, wallet: Wallet): Promise<any> {
    try {
      // 트랜잭션 서명
      const signedTx = wallet.sign(tx as any);
      
      // 트랜잭션 제출
      const result = await this.client.submitAndWait(signedTx.tx_blob);
      
      if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
        const meta = result.result.meta as any;
        if (meta.TransactionResult === 'tesSUCCESS') {
          return {
            success: true,
            hash: result.result.hash,
            result: result.result
          };
        } else {
          throw new Error(`Transaction failed: ${meta.TransactionResult}`);
        }
      } else {
        throw new Error('Invalid transaction result format');
      }
    } catch (error) {
      console.error('Transaction submission failed:', error);
      throw error;
    }
  }

  /**
   * 모든 발행자 지갑 목록 조회
   * @returns 발행자 지갑 목록
   */
  getAllIssuerWallets(): IssuerWalletData[] {
    return Array.from(this.issuerWallets.values());
  }

  /**
   * 프로젝트 발행자 지갑 비활성화
   * @param projectId - 프로젝트 ID
   */
  deactivateIssuerWallet(projectId: string): void {
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
  validateWallet(wallet: Wallet): ValidationResult {
    const errors: string[] = [];

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
  private xrpToDrops(xrp: string): string {
    return (parseFloat(xrp) * 1000000).toString();
  }

  /**
   * 드롭을 XRP로 변환
   * @param drops - 드롭 양
   * @returns XRP 양
   */
  private dropsToXrp(drops: string): string {
    return (parseFloat(drops) / 1000000).toString();
  }

  /**
   * 지갑 통계 조회
   * @returns 지갑 통계
   */
  getWalletStats(): { total: number; active: number; inactive: number } {
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
  hasIssuerWallet(projectId: string): boolean {
    return this.issuerWallets.has(projectId);
  }

  /**
   * 발행자 지갑 활성화 상태 확인
   * @param projectId - 프로젝트 ID
   * @returns 활성화 여부
   */
  isIssuerWalletActive(projectId: string): boolean {
    const issuerData = this.issuerWallets.get(projectId);
    return issuerData ? issuerData.isActive : false;
  }
}
