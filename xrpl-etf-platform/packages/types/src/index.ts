// XRPL 관련 타입
export interface XRPLAccount {
  address: string;
  publicKey?: string;
  privateKey?: string;
}

export interface XRPLTransaction {
  hash: string;
  account: string;
  destination?: string;
  amount: string;
  fee: string;
  sequence: number;
  timestamp: string;
}

// ETF 관련 타입
export interface ETFToken {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
  pricePerToken: number;
  underlyingAssets: UnderlyingAsset[];
}

export interface UnderlyingAsset {
  symbol: string;
  weight: number; // 포트폴리오 내 비중 (%)
  currentPrice: number;
  quantity: number;
}

// 사용자 관련 타입
export interface User {
  id: string;
  address: string;
  email?: string;
  createdAt: string;
  portfolio: Portfolio;
}

export interface Portfolio {
  totalValue: number;
  positions: Position[];
}

export interface Position {
  etfTokenId: string;
  quantity: number;
  averagePurchasePrice: number;
  currentValue: number;
  unrealizedPnL: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
