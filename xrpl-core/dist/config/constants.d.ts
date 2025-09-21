/**
 * 상수 정의
 */
import { ProjectStatus, InvestmentStatus, MilestoneStatus, EscrowStatus, BatchMode, InvestmentType, RiskLevel, NetworkType } from '../types';
export declare const PROJECT_STATUS: Record<string, ProjectStatus>;
export declare const INVESTMENT_STATUS: Record<string, InvestmentStatus>;
export declare const MILESTONE_STATUS: Record<string, MilestoneStatus>;
export declare const ESCROW_STATUS: Record<string, EscrowStatus>;
export declare const TRANSACTION_TYPES: {
    readonly PAYMENT: "Payment";
    readonly MPT_ISSUANCE_CREATE: "MPTokenIssuanceCreate";
    readonly MPT_AUTHORIZE: "MPTokenAuthorize";
    readonly ESCROW_CREATE: "EscrowCreate";
    readonly ESCROW_FINISH: "EscrowFinish";
    readonly ESCROW_CANCEL: "EscrowCancel";
    readonly BATCH: "Batch";
    readonly TRUST_SET: "TrustSet";
};
export declare const BATCH_MODES: Record<string, BatchMode>;
export declare const EVENT_TYPES: {
    readonly PROJECT_CREATED: "projectCreated";
    readonly PROJECT_FUNDED: "projectFunded";
    readonly PROJECT_COMPLETED: "projectCompleted";
    readonly INVESTMENT_PROCESSED: "investmentProcessed";
    readonly MILESTONE_ACHIEVED: "milestoneAchieved";
    readonly ESCROW_CREATED: "escrowCreated";
    readonly ESCROW_FINISHED: "escrowFinished";
    readonly TOKEN_MINTED: "tokenMinted";
    readonly TOKEN_TRANSFERRED: "tokenTransferred";
};
export declare const ERROR_CODES: {
    readonly INVALID_PROJECT: "INVALID_PROJECT";
    readonly INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS";
    readonly INVALID_AMOUNT: "INVALID_AMOUNT";
    readonly TRANSACTION_FAILED: "TRANSACTION_FAILED";
    readonly WALLET_NOT_FOUND: "WALLET_NOT_FOUND";
    readonly INVALID_SIGNATURE: "INVALID_SIGNATURE";
    readonly ESCROW_EXPIRED: "ESCROW_EXPIRED";
    readonly MILESTONE_NOT_ACHIEVED: "MILESTONE_NOT_ACHIEVED";
};
export declare const API_CODES: {
    readonly SUCCESS: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_ERROR: 500;
    readonly TOO_MANY_REQUESTS: 429;
};
export declare const TOKEN_UNITS: {
    readonly XRP: "XRP";
    readonly RLUSD: "RLUSD";
    readonly MPT: "MPT";
};
export declare const NETWORK_TYPES: Record<string, NetworkType>;
export declare const INVESTMENT_TYPES: Record<string, InvestmentType>;
export declare const RISK_LEVELS: Record<string, RiskLevel>;
export declare const FEE_STRUCTURES: {
    readonly EARLY_STAGE: {
        readonly investmentFee: 0.05;
        readonly platformTokenShare: 0.1;
        readonly transactionFee: 0.001;
        readonly escrowFee: 0.01;
    };
    readonly GROWTH_STAGE: {
        readonly investmentFee: 0.03;
        readonly platformTokenShare: 0.15;
        readonly transactionFee: 0.001;
        readonly escrowFee: 0.01;
    };
};
export declare const REVENUE_DISTRIBUTION: {
    readonly PLATFORM_SHARE: 0.05;
    readonly CREATOR_SHARE: 0.15;
    readonly INVESTOR_SHARE: 0.8;
};
export declare const ESCROW_CONDITION_TYPES: {
    readonly MILESTONE: "milestone";
    readonly TIME: "time";
    readonly MULTI: "multi";
    readonly VOTE: "vote";
};
export declare const FUNDING_ROUND_TYPES: {
    readonly SEED: "seed";
    readonly SERIES_A: "series_a";
    readonly SERIES_B: "series_b";
    readonly SERIES_C: "series_c";
    readonly IPO: "ipo";
};
//# sourceMappingURL=constants.d.ts.map