/**
 * XRPL Core Type Definitions
 */
import { Wallet } from 'xrpl';
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type InvestmentStatus = 'PENDING' | 'CONFIRMED' | 'REFUNDED' | 'FAILED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type EscrowStatus = 'ACTIVE' | 'FINISHED' | 'CANCELLED' | 'EXPIRED';
export type InvestmentType = 'equity' | 'debt' | 'revenue_share';
export type RiskLevel = 'low' | 'medium' | 'high';
export type BatchMode = 'ALLORNOTHING' | 'INDEPENDENT' | 'ONLYONE' | 'UNTILFAILURE';
export interface WalletInfo {
    address: string;
    publicKey: string;
    privateKey: string;
    algorithm?: string;
    xrp?: string;
    createdAt?: Date;
}
export interface IssuerWalletData {
    wallet: Wallet;
    projectId: string;
    createdAt: Date;
    isActive: boolean;
}
export interface ProjectData {
    id: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    creatorWallet: string;
    mptData?: MPTTokenData;
    milestones: MilestoneData[];
    investors: Map<string, InvestmentData>;
    status: ProjectStatus;
    website?: string;
    logo?: string;
    category: string;
    tags: string[];
    socialLinks: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
    fundedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
}
export interface MilestoneData {
    id: string;
    projectId: string;
    name: string;
    description: string;
    targetAmount: number;
    targetDate?: Date;
    requirements?: string[];
    rewardPercentage?: number;
    priority?: 'low' | 'medium' | 'high';
    status: MilestoneStatus;
    deadline: Date;
    achievedAt?: Date;
    evidence?: any;
    createdAt: Date;
    updatedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    failureReason?: string;
}
export interface InvestmentData {
    id: string;
    projectId: string;
    investorAddress: string;
    amount: number;
    tokens: number;
    rlusdAmount: number;
    tokenAmount: number;
    investmentType: InvestmentType;
    riskLevel: RiskLevel;
    status: InvestmentStatus;
    txHash?: string;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
    failureReason?: string;
    refundReason?: string;
    notes?: string;
}
export interface InvestmentRequest {
    projectId: string;
    investorWallet: Wallet;
    rlusdAmount?: number;
    xrpAmount?: number;
}
export interface InvestmentResult {
    success: boolean;
    message?: string;
    investmentId?: string;
    txHash?: string;
    tokensReceived?: number;
}
export interface MPTTokenData {
    projectId: string;
    issuerWallet: string;
    mptIssuanceId: string;
    name: string;
    symbol: string;
    description: string;
    totalSupply: number;
    circulatingSupply: number;
    metadata: Record<string, any>;
    flags: MPTFlags;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    holders: Map<string, number>;
}
export interface MPTFlags {
    MPTfTransferable: boolean;
    MPTfOnlyXRP: boolean;
    MPTfTrustLine: boolean;
}
export interface TokenMetadata {
    name: string;
    symbol: string;
    description: string;
    project_id: string;
    category: string;
    total_supply: number;
    target_amount: number;
    token_type: string;
    created_at: string;
    project_name?: string;
    creator?: {
        address: string;
        name: string;
        email: string;
    };
    version?: string;
    website?: string;
    logo?: string;
    tags?: string[];
    social_links?: Record<string, string>;
    metadata_hash?: string;
}
export interface EscrowData {
    id: string;
    escrowSequence?: number;
    projectId: string;
    milestoneId?: string;
    investorAddress: string;
    projectWallet?: string;
    tokenAmount: number;
    rlusdAmount: number;
    condition?: string;
    fulfillment?: string;
    deadline: Date;
    status: EscrowStatus;
    createdAt: Date;
    updatedAt: Date;
    finishedAt?: Date;
    cancelledAt?: Date;
    expiredAt?: Date;
    txHash?: string;
    finishTxHash?: string;
    cancelTxHash?: string;
    cancelReason?: string;
    expireReason?: string;
    notes?: string;
    investorSeed?: string;
    mptIssuanceId: string;
    conditionType: 'milestone' | 'time' | 'multi' | 'vote';
}
export interface EscrowResult {
    success: boolean;
    message?: string;
    escrowId?: string;
    txHash?: string;
    escrowSequence?: number;
    condition?: string;
    fulfillment?: string;
}
export interface ReleaseResult {
    success: boolean;
    message: string;
    txHash?: string;
}
export interface EscrowCondition {
    condition: string;
    fulfillment: string;
    projectId: string;
    milestoneId?: string;
}
export interface BatchTransactionData {
    account: string;
    transactions: TransactionData[];
    batchMode: BatchMode;
    fee?: string;
}
export interface TransactionData {
    TransactionType: string;
    Account: string;
    Destination?: string;
    Amount?: string | AmountObject;
    Fee?: string;
    MPTokenMetadata?: string;
    MaximumAmount?: string;
    MPTokenIssuanceID?: string;
    MPTokenAuthorize?: string;
    Flags?: any;
    [key: string]: any;
}
export interface AmountObject {
    currency?: string;
    value: string;
    issuer?: string;
    mpt_issuance_id?: string;
}
export interface FundingRoundData {
    id: string;
    projectId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    startDate: Date;
    endDate: Date;
    minimumInvestment: number;
    maximumInvestment: number;
    roundType: 'seed' | 'series_a' | 'series_b' | 'series_c' | 'ipo';
    status: 'active' | 'completed' | 'cancelled';
    investors: Map<string, InvestmentData>;
    createdAt: Date;
    updatedAt?: Date;
    completedAt?: Date;
}
export interface DistributionData {
    id: string;
    projectId: string;
    totalRevenue: number;
    distributionType: 'revenue' | 'milestone' | 'completion';
    platformShare: number;
    creatorShare: number;
    investorShare: number;
    investorShares: Map<string, number>;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: Date;
    completedAt?: Date;
    failedAt?: Date;
    cancelledAt?: Date;
    txHash?: string;
    failureReason?: string;
    cancelReason?: string;
}
export interface EventData {
    id: string;
    type: string;
    data: any;
    timestamp: Date;
    source: string;
}
export interface EventListener {
    eventType: string;
    listener: (event: EventData) => void;
    addedAt: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: string[];
    pagination?: PaginationData;
}
export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    pages: number;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
export interface XRPLConfig {
    networks: Record<NetworkType, NetworkConfig>;
    default: {
        network: NetworkType;
        timeout: number;
        maxRetries: number;
        retryDelay: number;
    };
    transaction: {
        fee: string;
        maxFee: string;
        timeout: number;
    };
    platform: {
        masterSeed: string;
        feePercentage: number;
        platformTokenPercentage: number;
    };
    mpt: {
        defaultFlags: MPTFlags;
        maxSupply: string;
    };
    escrow: {
        defaultDuration: number;
        maxDuration: number;
        minAmount: string;
    };
}
export interface NetworkConfig {
    server: string;
    name: string;
    description: string;
}
export interface ServiceContainer {
    xrplClient: any;
    walletManager: any;
    mptManager: any;
    escrowManager: any;
    batchManager: any;
    projectManager: any;
    fundingManager: any;
    distributionManager: any;
    eventEmitter: any;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface CryptoCondition {
    condition: string;
    fulfillment: string;
    conditionData: any;
}
export interface TokenDistribution {
    address: string;
    balance: number;
    percentage: number;
}
export interface ProjectStats {
    total: number;
    active: number;
    funded: number;
    completed: number;
    cancelled: number;
    totalRaised: number;
    totalTarget: number;
}
export interface InvestmentStats {
    total: number;
    pending: number;
    confirmed: number;
    failed: number;
    refunded: number;
    totalAmount: number;
}
export interface TokenStats {
    totalSupply: number;
    circulatingSupply: number;
    burnedSupply: number;
    holderCount: number;
    activeHolderCount: number;
    concentration: number;
    isActive: boolean;
}
export interface EscrowStats {
    total: number;
    active: number;
    finished: number;
    cancelled: number;
    expired: number;
}
export interface FeeStructure {
    investmentFee: number;
    platformTokenShare: number;
    transactionFee: number;
    escrowFee: number;
}
export interface RevenueDistribution {
    platformAmount: number;
    creatorAmount: number;
    investorAmount: number;
    investorShares: Array<[string, number]>;
}
export interface EscrowConditionData {
    type: 'milestone' | 'time' | 'multi' | 'vote';
    projectId: string;
    milestoneId?: string;
    deadline?: Date;
    requiredAmount?: number;
    minimumPercentage?: number;
    requiredVotes?: number;
    conditions?: EscrowConditionData[];
    operator?: 'AND' | 'OR';
}
export interface BatchResult {
    success: boolean;
    message?: string;
    hash?: string;
    result?: any;
    batchId?: string;
    innerTransactionCount?: number;
    totalAmount?: number;
}
export type BatchStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export interface MultiSigBatchData {
    batchId: string;
    transactions: TransactionData[];
    signers: Wallet[];
}
//# sourceMappingURL=index.d.ts.map