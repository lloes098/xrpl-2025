"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceContainer = void 0;
const xrpl_1 = require("xrpl");
const MPTManager_1 = require("./mpt/MPTManager");
const TokenEscrowManager_1 = require("./escrow/TokenEscrowManager");
const BatchManager_1 = require("./batch/BatchManager");
const WalletManager_1 = require("./wallet/WalletManager");
const ProjectManager_1 = require("./project/ProjectManager");
/**
 * 서비스 컨테이너 (싱글톤 패턴)
 * 모든 API 라우트에서 동일한 서비스 인스턴스를 사용
 */
class ServiceContainer {
    constructor() {
        this._xrplClient = null;
        this._walletManager = null;
        this._mptManager = null;
        this._escrowManager = null;
        this._batchManager = null;
        this._projectManager = null;
        this._isInitialized = false;
    }
    static getInstance() {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }
    async initialize() {
        if (this._isInitialized)
            return;
        try {
            // XRPL 클라이언트 연결
            this._xrplClient = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
            await this._xrplClient.connect();
            console.log('✅ XRPL Client connected to devnet');
            // 서비스들 초기화
            this._walletManager = new WalletManager_1.WalletManager(this._xrplClient);
            // 플랫폼 마스터 지갑 초기화
            const platformSeed = 'sEd7vWe7bM7gX92865hGokZssJmy757';
            await this._walletManager.initializePlatformWallet(platformSeed);
            this._mptManager = new MPTManager_1.MPTManager(this._xrplClient, this._walletManager);
            this._escrowManager = new TokenEscrowManager_1.TokenEscrowManager(this._xrplClient);
            this._batchManager = new BatchManager_1.BatchManager(this._xrplClient);
            this._projectManager = new ProjectManager_1.ProjectManager(this._xrplClient, this._mptManager, this._escrowManager, this._batchManager, this._walletManager);
            this._isInitialized = true;
            console.log('✅ All services initialized');
        }
        catch (error) {
            console.error('❌ Service initialization failed:', error);
            throw error;
        }
    }
    get xrplClient() {
        if (!this._xrplClient)
            throw new Error('Services not initialized');
        return this._xrplClient;
    }
    get walletManager() {
        if (!this._walletManager)
            throw new Error('Services not initialized');
        return this._walletManager;
    }
    get mptManager() {
        if (!this._mptManager)
            throw new Error('Services not initialized');
        return this._mptManager;
    }
    get escrowManager() {
        if (!this._escrowManager)
            throw new Error('Services not initialized');
        return this._escrowManager;
    }
    get batchManager() {
        if (!this._batchManager)
            throw new Error('Services not initialized');
        return this._batchManager;
    }
    get projectManager() {
        if (!this._projectManager)
            throw new Error('Services not initialized');
        return this._projectManager;
    }
    get isInitialized() {
        return this._isInitialized;
    }
}
exports.ServiceContainer = ServiceContainer;
//# sourceMappingURL=ServiceContainer.js.map