/**
 * XRPL Core Type Definitions
 */

import { Wallet } from 'xrpl';

// ===== 기본 타입 =====
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type InvestmentStatus = 'PENDING' | 'CONFIRMED' | 'REFUNDED' | 'FAILED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type EscrowStatus = 'ACTIVE' | 'FINISHED' | 'CANCELLED' | 'EXPIRED';
export type InvestmentType = 'equity' | 'debt' | 'revenue_share';
export type RiskLevel = 'low' | 'medium' | 'high';
export type BatchMode = 'ALLORNOTHING' | 'INDEPENDENT' | 'ONLYONE' | 'UNTILFAILURE';

// ===== 지갑 관련 타입 =====
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

// ===== 프로젝트 관련 타입 =====
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

// ===== 투자 관련 타입 =====
export interface InvestmentData {
  id: string;
  projectId: string;
  investorAddress: string;
  amount: number; // 투자 금액 (XRP)
  tokens: number; // 받은 토큰 수
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
  rlusdAmount: number;
}

export interface InvestmentResult {
  success: boolean;
  message?: string;
  investmentId?: string;
  txHash?: string;
  tokensReceived?: number;
}

// https://github.com/RippleDevRel/xrpl-js-python-simple-scripts/blob/main/devnet/mpt.js

// const tokenMetadata = {
//   name: "DevNet Demo Token",
//   ticker: "DDT",
//   description: "A demonstration Multi-Purpose Token for XRPL Devnet testing",
//   decimals: 2,
//   total_supply: "100000000", // 1,000,000 units
//   asset_class: "other", 
//   icon: "https://xrpl.org/assets/favicon.16698f9bee80e5687493ed116f24a6633bb5eaa3071414d64b3bed30c3db1d1d.8a5edab2.ico",
//   use_case: "Educational demonstration",
//   issuer_name: "yourfavdevrel"
// };

// ===== MPT 토큰 관련 타입 =====
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
  project_name: string;
  category: string;
  total_supply: number;
  target_amount: number;
  token_type: string;
  creator: {
    address: string;
    name: string;
    email: string;
  };
  created_at: string;
  version: string;
  website?: string;
  logo?: string;
  tags: string[];
  social_links: Record<string, string>;
  metadata_hash: string;
}

// ===== 에스크로 관련 타입 =====
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
  investorSeed?: string; // 투자자 시드 (테스트용)
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

// ===== 배치 트랜잭션 관련 타입 =====
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

// ===== 펀딩 관련 타입 =====
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

// ===== 이벤트 관련 타입 =====
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

// ===== API 관련 타입 =====
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

// ===== 설정 관련 타입 =====
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

// ===== 서비스 컨테이너 타입 =====
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

// ===== 유틸리티 타입 =====
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

// ===== 통계 관련 타입 =====
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

// ===== 수수료 구조 타입 =====
export interface FeeStructure {
  investmentFee: number;        // 투자금 수수료 (초기 5%, 성장 3%)
  platformTokenShare: number;  // 플랫폼 토큰 지분 (10-15%)
  transactionFee: number;       // 거래 수수료 (0.1%)
  escrowFee: number;           // 에스크로 수수료
}

// ===== 수익 분배 타입 =====
export interface RevenueDistribution {
  platformAmount: number;
  creatorAmount: number;
  investorAmount: number;
  investorShares: Array<[string, number]>;
}

// ===== 에스크로 조건 타입 =====
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

// ===== 배치 트랜잭션 결과 타입 =====
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
