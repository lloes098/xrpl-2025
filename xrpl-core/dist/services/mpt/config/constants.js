"use strict";
/**
 * 상수 정의
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNDING_ROUND_TYPES = exports.ESCROW_CONDITION_TYPES = exports.REVENUE_DISTRIBUTION = exports.FEE_STRUCTURES = exports.RISK_LEVELS = exports.INVESTMENT_TYPES = exports.NETWORK_TYPES = exports.TOKEN_UNITS = exports.API_CODES = exports.ERROR_CODES = exports.EVENT_TYPES = exports.BATCH_MODES = exports.TRANSACTION_TYPES = exports.ESCROW_STATUS = exports.MILESTONE_STATUS = exports.INVESTMENT_STATUS = exports.PROJECT_STATUS = void 0;
// 프로젝트 상태
exports.PROJECT_STATUS = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    FUNDED: 'FUNDED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED'
};
// 투자 상태
exports.INVESTMENT_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    REFUNDED: 'REFUNDED',
    FAILED: 'FAILED'
};
// 마일스톤 상태
exports.MILESTONE_STATUS = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};
// 에스크로 상태
exports.ESCROW_STATUS = {
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED'
};
// 트랜잭션 타입
exports.TRANSACTION_TYPES = {
    PAYMENT: 'Payment',
    MPT_ISSUANCE_CREATE: 'MPTokenIssuanceCreate',
    MPT_AUTHORIZE: 'MPTokenAuthorize',
    ESCROW_CREATE: 'EscrowCreate',
    ESCROW_FINISH: 'EscrowFinish',
    ESCROW_CANCEL: 'EscrowCancel',
    BATCH: 'Batch',
    TRUST_SET: 'TrustSet'
};
// 배치 모드
exports.BATCH_MODES = {
    ALL_OR_NOTHING: 'ALLORNOTHING',
    INDEPENDENT: 'INDEPENDENT',
    ONLY_ONE: 'ONLYONE',
    UNTIL_FAILURE: 'UNTILFAILURE'
};
// 이벤트 타입
exports.EVENT_TYPES = {
    PROJECT_CREATED: 'projectCreated',
    PROJECT_FUNDED: 'projectFunded',
    PROJECT_COMPLETED: 'projectCompleted',
    INVESTMENT_PROCESSED: 'investmentProcessed',
    MILESTONE_ACHIEVED: 'milestoneAchieved',
    ESCROW_CREATED: 'escrowCreated',
    ESCROW_FINISHED: 'escrowFinished',
    TOKEN_MINTED: 'tokenMinted',
    TOKEN_TRANSFERRED: 'tokenTransferred'
};
// 에러 코드
exports.ERROR_CODES = {
    INVALID_PROJECT: 'INVALID_PROJECT',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
    INVALID_SIGNATURE: 'INVALID_SIGNATURE',
    ESCROW_EXPIRED: 'ESCROW_EXPIRED',
    MILESTONE_NOT_ACHIEVED: 'MILESTONE_NOT_ACHIEVED'
};
// API 응답 코드
exports.API_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    TOO_MANY_REQUESTS: 429
};
// 토큰 단위
exports.TOKEN_UNITS = {
    XRP: 'XRP',
    RLUSD: 'RLUSD',
    MPT: 'MPT'
};
// 네트워크 타입
exports.NETWORK_TYPES = {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
    DEVNET: 'devnet'
};
// 투자 타입
exports.INVESTMENT_TYPES = {
    EQUITY: 'equity',
    DEBT: 'debt',
    REVENUE_SHARE: 'revenue_share'
};
// 리스크 레벨
exports.RISK_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};
// 수수료 구조 (플랫폼 성장 단계별)
exports.FEE_STRUCTURES = {
    EARLY_STAGE: {
        investmentFee: 0.05, // 5%
        platformTokenShare: 0.10, // 10%
        transactionFee: 0.001, // 0.1%
        escrowFee: 0.01 // 1%
    },
    GROWTH_STAGE: {
        investmentFee: 0.03, // 3%
        platformTokenShare: 0.15, // 15%
        transactionFee: 0.001, // 0.1%
        escrowFee: 0.01 // 1%
    }
};
// 수익 분배 비율
exports.REVENUE_DISTRIBUTION = {
    PLATFORM_SHARE: 0.05, // 5%
    CREATOR_SHARE: 0.15, // 15%
    INVESTOR_SHARE: 0.80 // 80%
};
// 에스크로 조건 타입
exports.ESCROW_CONDITION_TYPES = {
    MILESTONE: 'milestone',
    TIME: 'time',
    MULTI: 'multi',
    VOTE: 'vote'
};
// 펀딩 라운드 타입
exports.FUNDING_ROUND_TYPES = {
    SEED: 'seed',
    SERIES_A: 'series_a',
    SERIES_B: 'series_b',
    SERIES_C: 'series_c',
    IPO: 'ipo'
};
