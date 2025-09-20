import {
  Proposal,
  PortfolioState,
  UserPortfolio,
  Manager,
  DashboardKPIs,
  VoteSummary,
  Transaction,
  ChartDataPoint,
  PieChartData,
} from "./types";

// Mock proposals
export const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "BTC 비중 15% 증가 제안",
    author: "manager1.xrp",
    changes: [
      { asset: "BTC", weightPct: 45 },
      { asset: "ETH", weightPct: 25 },
      { asset: "XRP", weightPct: 20 },
      { asset: "RLUSD", weightPct: 10 },
    ],
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    rationale: "최근 BTC의 기관 채택 증가와 ETF 승인으로 인한 상승 동력이 지속될 것으로 예상됩니다. 현재 30%에서 45%로 증가하여 포트폴리오의 안정성을 높이고자 합니다.",
    status: "active",
    votesFor: 2847,
    votesAgainst: 1293,
    totalVotes: 5000,
    myVote: undefined,
  },
  {
    id: "2",
    title: "SOL 신규 편입 및 10% 비중 제안",
    author: "crypto_analyst",
    changes: [
      { asset: "BTC", weightPct: 30 },
      { asset: "ETH", weightPct: 25 },
      { asset: "XRP", weightPct: 25 },
      { asset: "SOL", weightPct: 10 },
      { asset: "VNXAU", weightPct: 10 },
    ],
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    rationale: "솔라나 생태계의 급속한 성장과 DeFi 프로토콜 확산을 고려하여 포트폴리오에 편입을 제안합니다. 높은 성장 잠재력과 함께 분산 투자 효과를 기대할 수 있습니다.",
    status: "active",
    votesFor: 1857,
    votesAgainst: 743,
    totalVotes: 3200,
  },
  {
    id: "3",
    title: "VNXAU(골드) 비중 20% 확대",
    author: "gold_strategist",
    changes: [
      { asset: "BTC", weightPct: 25 },
      { asset: "ETH", weightPct: 20 },
      { asset: "XRP", weightPct: 25 },
      { asset: "VNXAU", weightPct: 20 },
      { asset: "RLUSD", weightPct: 10 },
    ],
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    rationale: "글로벌 인플레이션과 지정학적 리스크 증가로 인한 안전자산 선호 현상이 지속되고 있습니다. 골드 토큰화 자산인 VNXAU 비중을 늘려 포트폴리오 안정성을 높이고자 합니다.",
    status: "active",
    votesFor: 3421,
    votesAgainst: 2156,
    totalVotes: 6000,
    myVote: "for",
  },
  {
    id: "4",
    title: "ETH 스테이킹 수익률 극대화 전략",
    author: "eth_validator",
    changes: [
      { asset: "BTC", weightPct: 25 },
      { asset: "ETH", weightPct: 40 },
      { asset: "XRP", weightPct: 20 },
      { asset: "RLUSD", weightPct: 15 },
    ],
    endsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rationale: "이더리움 2.0 스테이킹 수익률 증가와 EIP-1559 이후 디플레이션 효과를 활용한 전략입니다.",
    status: "passed",
    votesFor: 4200,
    votesAgainst: 1800,
    totalVotes: 6000,
  },
];

// Mock portfolio state
export const mockPortfolioState: PortfolioState = {
  totalValueXRP: 125847.32,
  allocations: [
    { asset: "BTC", weightPct: 30 },
    { asset: "ETH", weightPct: 25 },
    { asset: "XRP", weightPct: 25 },
    { asset: "VNXAU", weightPct: 15 },
    { asset: "RLUSD", weightPct: 5 },
  ],
  pnl1dPct: 2.34,
  pnl7dPct: 8.92,
  pnl30dPct: 15.67,
};

// Mock user portfolio
export const mockUserPortfolio: UserPortfolio = {
  etfxBalance: 1250.75,
  stakedXRP: 25000,
  avgBuyPrice: 19.85,
  unrealizedPnl: 2847.32,
  unrealizedPnlPct: 12.85,
};

// Mock managers
export const mockManagers: Manager[] = [
  {
    id: "1",
    name: "CryptoStrategist",
    depositAmount: 50000,
    performance7d: 8.5,
    authorityRatio: 25.5,
    proposalAcceptanceRate: 78.5,
    reputation: 94,
    isActive: true,
  },
  {
    id: "2",
    name: "DeFiMaster",
    depositAmount: 75000,
    performance7d: 12.3,
    authorityRatio: 35.2,
    proposalAcceptanceRate: 85.2,
    reputation: 97,
    isActive: true,
  },
  {
    id: "3",
    name: "GoldBullion",
    depositAmount: 30000,
    performance7d: 4.7,
    authorityRatio: 15.8,
    proposalAcceptanceRate: 62.3,
    reputation: 88,
    isActive: true,
  },
  {
    id: "4",
    name: "RiskManager",
    depositAmount: 45000,
    performance7d: -2.1,
    authorityRatio: 23.5,
    proposalAcceptanceRate: 71.4,
    reputation: 82,
    isActive: false,
  },
];

// Mock dashboard KPIs
export const mockDashboardKPIs: DashboardKPIs = {
  totalStakedXRP: 2847293.47,
  dailyPnl: 15847.32,
  dailyPnlPct: 2.34,
  activeProposals: 3,
  myETFXBalance: 1250.75,
  governanceTokens: 850,
};

// Mock vote summaries for dashboard
export const mockVoteSummaries: VoteSummary[] = [
  {
    id: "1",
    title: "BTC 비중 15% 증가 제안",
    summary: "BTC 30% → 45% 증가, 기관 채택 증가 반영",
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    votesFor: 2847,
    votesAgainst: 1293,
    totalVotes: 5000,
    status: "active",
  },
  {
    id: "2",
    title: "SOL 신규 편입 제안",
    summary: "SOL 10% 신규 편입, 생태계 성장 기대",
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    votesFor: 1857,
    votesAgainst: 743,
    totalVotes: 3200,
    status: "active",
  },
  {
    id: "3",
    title: "VNXAU 비중 확대",
    summary: "골드 5% → 20% 확대, 안전자산 선호",
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    votesFor: 3421,
    votesAgainst: 2156,
    totalVotes: 6000,
    status: "active",
  },
];

// Mock performance chart data
export const mockPerformanceData: ChartDataPoint[] = [
  { timestamp: "2024-01-01", value: 100 },
  { timestamp: "2024-01-02", value: 102.3 },
  { timestamp: "2024-01-03", value: 101.8 },
  { timestamp: "2024-01-04", value: 104.5 },
  { timestamp: "2024-01-05", value: 106.2 },
  { timestamp: "2024-01-06", value: 105.1 },
  { timestamp: "2024-01-07", value: 108.9 },
  { timestamp: "2024-01-08", value: 110.4 },
  { timestamp: "2024-01-09", value: 109.7 },
  { timestamp: "2024-01-10", value: 112.3 },
  { timestamp: "2024-01-11", value: 115.6 },
  { timestamp: "2024-01-12", value: 114.2 },
  { timestamp: "2024-01-13", value: 116.8 },
  { timestamp: "2024-01-14", value: 115.7 },
];

// Mock pie chart data
export const mockPieChartData: PieChartData[] = [
  { asset: "BTC", value: 37760.2, percentage: 30, color: "#F7931A" },
  { asset: "ETH", value: 31466.83, percentage: 25, color: "#627EEA" },
  { asset: "XRP", value: 31466.83, percentage: 25, color: "#00AAE4" },
  { asset: "VNXAU", value: 18880.1, percentage: 15, color: "#FFD700" },
  { asset: "RLUSD", value: 6292.37, percentage: 5, color: "#00D4AA" },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    amount: 5000,
    asset: "XRP",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    txHash: "0x1234...5678",
  },
  {
    id: "2",
    type: "vote",
    amount: 100,
    asset: "XRP",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    txHash: "0x2345...6789",
  },
  {
    id: "3",
    type: "withdraw",
    amount: 1250,
    asset: "XRP",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    txHash: "0x3456...7890",
  },
];
