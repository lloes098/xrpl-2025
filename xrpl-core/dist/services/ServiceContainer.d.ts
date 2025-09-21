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
export declare class ServiceContainer {
    private static instance;
    private _xrplClient;
    private _walletManager;
    private _mptManager;
    private _escrowManager;
    private _batchManager;
    private _projectManager;
    private _isInitialized;
    private constructor();
    static getInstance(): ServiceContainer;
    initialize(): Promise<void>;
    get xrplClient(): Client;
    get walletManager(): WalletManager;
    get mptManager(): MPTManager;
    get escrowManager(): TokenEscrowManager;
    get batchManager(): BatchManager;
    get projectManager(): ProjectManager;
    get isInitialized(): boolean;
}
//# sourceMappingURL=ServiceContainer.d.ts.map