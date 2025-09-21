// MPT 토큰 관련 API 함수들

export interface MPTMetadata {
  name: string;
  description: string;
  projectId: string;
  totalSupply: number;
  targetAmount: number;
  website: string;
  logo: string;
  category: string;
  tags: string[];
  socialLinks: {
    twitter: string;
    discord: string;
    github: string;
  };
  creator: string;
  startDate: string;
  endDate: string;
  status: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  blockchain: string;
  tokenType: string;
  network: string;
}

export interface CreateMPTRequest {
  projectData: {
    id: string;
    title: string;
    description: string;
    category: string;
    targetAmount: number;
    website?: string;
    logo?: string;
    tags?: string[];
    socialLinks?: {
      twitter?: string;
      discord?: string;
      github?: string;
    };
    creator: string;
    startDate?: string;
    endDate?: string;
    fundingGoal: number;
  };
  adminSeed: string;
  userSeed?: string;
  assetScale?: number;
  maximumAmount?: string;
}

export interface CreateMPTResponse {
  success: boolean;
  data?: {
    issuanceId: string;
    transactionResult: Record<string, unknown>;
    metadata: MPTMetadata;
    projectId: string;
  };
  error?: string;
}

export interface MPTInfoResponse {
  success: boolean;
  data?: {
    issuanceId: string;
    metadata: MPTMetadata;
    mptData: Record<string, unknown>;
    owner: string;
    issuer: string;
    assetScale: number;
    maximumAmount: string;
  };
  error?: string;
}

/**
 * MPT 토큰 생성
 */
export async function createMPToken(request: CreateMPTRequest): Promise<CreateMPTResponse> {
  try {
    const response = await fetch('/api/mpt/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MPT 토큰 생성 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * MPT 토큰 정보 조회
 */
export async function getMPTInfo(issuanceId: string): Promise<MPTInfoResponse> {
  try {
    const response = await fetch(`/api/mpt/info?issuanceId=${encodeURIComponent(issuanceId)}`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MPT 토큰 정보 조회 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
