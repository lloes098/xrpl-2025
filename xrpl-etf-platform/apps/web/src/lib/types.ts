// Core asset types
export type Asset = "BTC" | "ETH" | "XRP" | "SOL" | "VNXAU" | "RLUSD";

// Portfolio allocation
export interface Allocation {
  asset: Asset;
  weightPct: number;
}

// Governance proposal
export interface Proposal {
  id: string;
  title: string;
  author: string;
  changes: Allocation[];
  endsAt: string; // ISO string
  rationale: string;
  status: "active" | "passed" | "rejected" | "expired";
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  myVote?: "for" | "against";
}

// Portfolio state
export interface PortfolioState {
  totalValueXRP: number;
  allocations: Allocation[];
  pnl1dPct: number;
  pnl7dPct: number;
  pnl30dPct: number;
}

// User portfolio
export interface UserPortfolio {
  etfxBalance: number;
  stakedXRP: number;
  avgBuyPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
}

// Manager info
export interface Manager {
  id: string;
  name: string;
  depositAmount: number;
  performance7d: number;
  authorityRatio: number;
  proposalAcceptanceRate: number;
  reputation: number;
  isActive: boolean;
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalStakedXRP: number;
  dailyPnl: number;
  dailyPnlPct: number;
  activeProposals: number;
  myETFXBalance: number;
  governanceTokens: number;
}

// Network types
export type NetworkType = "testnet" | "devnet" | "mainnet";

// Wallet state
export interface WalletState {
  isConnected: boolean;
  address?: string;
  network: NetworkType;
  balance: number;
}

// Settings
export interface AppSettings {
  network: NetworkType;
  developerMode: boolean;
  mockDataEnabled: boolean;
}

// Chart data types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  asset: Asset;
  value: number;
  percentage: number;
  color: string;
}

// Transaction types
export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "vote" | "rebalance";
  amount: number;
  asset: Asset;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
  txHash?: string;
}

// Vote summary for dashboard
export interface VoteSummary {
  id: string;
  title: string;
  summary: string;
  endsAt: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  status: Proposal["status"];
}
