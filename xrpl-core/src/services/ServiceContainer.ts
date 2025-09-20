import { Client } from 'xrpl';
import { MPTManager } from './mpt/MPTManager';
import { TokenEscrowManager } from './escrow/TokenEscrowManager';
import { BatchManager } from './batch/BatchManager';
import { WalletManager } from './wallet/WalletManager';
import { ProjectManager } from './project/ProjectManager';

/**
 * 서비스 컨테이너 (싱글톤 패턴)
 * 모든 API 라우트에서 동일한 서비스 인스턴스를 사용
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private _xrplClient: Client | null = null;
  private _walletManager: WalletManager | null = null;
  private _mptManager: MPTManager | null = null;
  private _escrowManager: TokenEscrowManager | null = null;
  private _batchManager: BatchManager | null = null;
  private _projectManager: ProjectManager | null = null;
  private _isInitialized = false;

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    try {
      // XRPL 클라이언트 연결
      this._xrplClient = new Client('wss://s.devnet.rippletest.net:51233');
      await this._xrplClient.connect();
      console.log('✅ XRPL Client connected to devnet');

      // 서비스들 초기화
      this._walletManager = new WalletManager(this._xrplClient);
      
      // 플랫폼 마스터 지갑 초기화
      const platformSeed = 'sEd7vWe7bM7gX92865hGokZssJmy757';
      await this._walletManager.initializePlatformWallet(platformSeed);
      
      this._mptManager = new MPTManager(this._xrplClient, this._walletManager);
      this._escrowManager = new TokenEscrowManager(this._xrplClient);
      this._batchManager = new BatchManager(this._xrplClient);
      
      this._projectManager = new ProjectManager(
        this._xrplClient,
        this._mptManager,
        this._escrowManager,
        this._batchManager,
        this._walletManager
      );

      this._isInitialized = true;
      console.log('✅ All services initialized');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  get xrplClient(): Client {
    if (!this._xrplClient) throw new Error('Services not initialized');
    return this._xrplClient;
  }

  get walletManager(): WalletManager {
    if (!this._walletManager) throw new Error('Services not initialized');
    return this._walletManager;
  }

  get mptManager(): MPTManager {
    if (!this._mptManager) throw new Error('Services not initialized');
    return this._mptManager;
  }

  get escrowManager(): TokenEscrowManager {
    if (!this._escrowManager) throw new Error('Services not initialized');
    return this._escrowManager;
  }

  get batchManager(): BatchManager {
    if (!this._batchManager) throw new Error('Services not initialized');
    return this._batchManager;
  }

  get projectManager(): ProjectManager {
    if (!this._projectManager) throw new Error('Services not initialized');
    return this._projectManager;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
