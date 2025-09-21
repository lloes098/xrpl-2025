/**
 * Escrow API Client
 * 프론트엔드에서 에스크로 API를 호출하는 클라이언트
 */

export interface EscrowCreateRequest {
  creatorSeed: string;
  destination: string;
  amount: number;
  currency?: string;
  tokenIssuer?: string;
  finishAfterDays?: number;
  cancelAfterDays?: number;
  network?: 'testnet' | 'mainnet';
}

export interface EscrowFinishRequest {
  finisherSeed: string;
  ownerAddress: string;
  offerSequence: number;
  network?: 'testnet' | 'mainnet';
  autoFinish?: boolean;
}

export interface EscrowCancelRequest {
  cancelerSeed: string;
  ownerAddress: string;
  offerSequence: number;
  network?: 'testnet' | 'mainnet';
  autoCancel?: boolean;
}

export interface EscrowInfoRequest {
  ownerAddress: string;
  offerSequence: number;
  network?: 'testnet' | 'mainnet';
}

export interface EscrowResponse {
  success: boolean;
  txHash?: string;
  sequence?: number;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * 에스크로 생성
 */
export async function createEscrowAPI(request: EscrowCreateRequest): Promise<EscrowResponse> {
  try {
    const response = await fetch('/api/escrow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * 에스크로 해제
 */
export async function finishEscrowAPI(request: EscrowFinishRequest): Promise<EscrowResponse> {
  try {
    const response = await fetch('/api/escrow/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * 에스크로 취소
 */
export async function cancelEscrowAPI(request: EscrowCancelRequest): Promise<EscrowResponse> {
  try {
    const response = await fetch('/api/escrow/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * 에스크로 정보 조회
 */
export async function getEscrowInfoAPI(request: EscrowInfoRequest): Promise<EscrowResponse> {
  try {
    const params = new URLSearchParams({
      ownerAddress: request.ownerAddress,
      offerSequence: request.offerSequence.toString(),
      network: request.network || 'testnet'
    });

    const response = await fetch(`/api/escrow/info?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * 에스크로 상태 조회
 */
export async function getEscrowStatusAPI(request: EscrowInfoRequest): Promise<EscrowResponse> {
  try {
    const params = new URLSearchParams({
      ownerAddress: request.ownerAddress,
      offerSequence: request.offerSequence.toString(),
      network: request.network || 'testnet'
    });

    const response = await fetch(`/api/escrow/status?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}
