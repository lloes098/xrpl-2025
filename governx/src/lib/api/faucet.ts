/**
 * Faucet API Client
 * 테스트용 XRP를 받기 위한 API 클라이언트
 */

export interface FaucetRequest {
  address: string;
  network?: 'testnet' | 'mainnet';
}

export interface FaucetResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * 테스트용 XRP 요청
 */
export async function requestTestXRP(request: FaucetRequest): Promise<FaucetResponse> {
  try {
    const response = await fetch('/api/faucet', {
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
