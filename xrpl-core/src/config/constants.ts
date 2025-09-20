/**
 * 상수 정의
 */

import { 
  ProjectStatus, 
  InvestmentStatus, 
  MilestoneStatus, 
  EscrowStatus, 
  BatchMode, 
  InvestmentType, 
  RiskLevel, 
  NetworkType 
} from '../types';

// 프로젝트 상태
export const PROJECT_STATUS: Record<string, ProjectStatus> = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  FUNDED: 'FUNDED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED'
} as const;

// 투자 상태
export const INVESTMENT_STATUS: Record<string, InvestmentStatus> = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED'
} as const;

// 마일스톤 상태
export const MILESTONE_STATUS: Record<string, MilestoneStatus> = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

// 에스크로 상태
export const ESCROW_STATUS: Record<string, EscrowStatus> = {
  ACTIVE: 'ACTIVE',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
} as const;

// 트랜잭션 타입
export const TRANSACTION_TYPES = {
  PAYMENT: 'Payment',
  MPT_ISSUANCE_CREATE: 'MPTokenIssuanceCreate',
  MPT_AUTHORIZE: 'MPTokenAuthorize',
  ESCROW_CREATE: 'EscrowCreate',
  ESCROW_FINISH: 'EscrowFinish',
  ESCROW_CANCEL: 'EscrowCancel',
  BATCH: 'Batch',
  TRUST_SET: 'TrustSet'
} as const;

// 배치 모드
export const BATCH_MODES: Record<string, BatchMode> = {
  ALL_OR_NOTHING: 'ALLORNOTHING',
  INDEPENDENT: 'INDEPENDENT',
  ONLY_ONE: 'ONLYONE',
  UNTIL_FAILURE: 'UNTILFAILURE'
} as const;

// 이벤트 타입
export const EVENT_TYPES = {
  PROJECT_CREATED: 'projectCreated',
  PROJECT_FUNDED: 'projectFunded',
  PROJECT_COMPLETED: 'projectCompleted',
  INVESTMENT_PROCESSED: 'investmentProcessed',
  MILESTONE_ACHIEVED: 'milestoneAchieved',
  ESCROW_CREATED: 'escrowCreated',
  ESCROW_FINISHED: 'escrowFinished',
  TOKEN_MINTED: 'tokenMinted',
  TOKEN_TRANSFERRED: 'tokenTransferred'
} as const;

// 에러 코드
export const ERROR_CODES = {
  INVALID_PROJECT: 'INVALID_PROJECT',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  ESCROW_EXPIRED: 'ESCROW_EXPIRED',
  MILESTONE_NOT_ACHIEVED: 'MILESTONE_NOT_ACHIEVED'
} as const;

// API 응답 코드
export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  TOO_MANY_REQUESTS: 429
} as const;

// 토큰 단위
export const TOKEN_UNITS = {
  XRP: 'XRP',
  RLUSD: 'RLUSD',
  MPT: 'MPT'
} as const;

// 네트워크 타입
export const NETWORK_TYPES: Record<string, NetworkType> = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  DEVNET: 'devnet'
} as const;

// 투자 타입
export const INVESTMENT_TYPES: Record<string, InvestmentType> = {
  EQUITY: 'equity',
  DEBT: 'debt',
  REVENUE_SHARE: 'revenue_share'
} as const;

// 리스크 레벨
export const RISK_LEVELS: Record<string, RiskLevel> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

// 수수료 구조 (플랫폼 성장 단계별)
export const FEE_STRUCTURES = {
  EARLY_STAGE: {
    investmentFee: 0.05,        // 5%
    platformTokenShare: 0.10,  // 10%
    transactionFee: 0.001,      // 0.1%
    escrowFee: 0.01             // 1%
  },
  GROWTH_STAGE: {
    investmentFee: 0.03,        // 3%
    platformTokenShare: 0.15,  // 15%
    transactionFee: 0.001,      // 0.1%
    escrowFee: 0.01             // 1%
  }
} as const;

// 수익 분배 비율
export const REVENUE_DISTRIBUTION = {
  PLATFORM_SHARE: 0.05,  // 5%
  CREATOR_SHARE: 0.15,   // 15%
  INVESTOR_SHARE: 0.80   // 80%
} as const;

// 에스크로 조건 타입
export const ESCROW_CONDITION_TYPES = {
  MILESTONE: 'milestone',
  TIME: 'time',
  MULTI: 'multi',
  VOTE: 'vote'
} as const;

// 펀딩 라운드 타입
export const FUNDING_ROUND_TYPES = {
  SEED: 'seed',
  SERIES_A: 'series_a',
  SERIES_B: 'series_b',
  SERIES_C: 'series_c',
  IPO: 'ipo'
} as const;
