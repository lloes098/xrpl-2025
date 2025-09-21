// Token Escrow 관련 API 함수들

export interface EscrowCreateRequest {
  type: 'mpt' | 'iou';
  issuanceId?: string; // MPT의 경우
  currency?: string; // IOU의 경우
  issuer?: string; // IOU의 경우
  value: string;
  destination: string;
  finishAfter: number; // 초 단위
  cancelAfter: number; // 초 단위
  condition?: string; // 선택사항
  adminSeed: string;
  userSeed: string;
  user2Seed: string;
}

export interface EscrowCreateResponse {
  success: boolean;
  data?: {
    type: 'mpt' | 'iou';
    sequence: number;
    transactionResult: Record<string, unknown>;
    escrowInfo: {
      owner: string;
      destination: string;
      value: string;
      finishAfter: string;
      cancelAfter: string;
      condition: string | null;
    };
  };
  error?: string;
}

export interface EscrowFinishRequest {
  ownerAddress: string;
  offerSequence: number;
  finisherSeed?: string;
  fulfillment?: string;
  adminSeed: string;
  userSeed: string;
  user2Seed: string;
}

export interface EscrowCancelRequest {
  ownerAddress: string;
  offerSequence: number;
  cancelerSeed?: string;
  adminSeed: string;
  userSeed: string;
  user2Seed: string;
}

export interface EscrowInfoRequest {
  ownerAddress: string;
  offerSequence: number;
  adminSeed: string;
  userSeed: string;
  user2Seed: string;
}

export interface EscrowActionResponse {
  success: boolean;
  data?: {
    transactionResult: Record<string, unknown>;
    escrowInfo: {
      owner: string;
      sequence: number;
      action: 'finished' | 'cancelled';
      timestamp: string;
    };
  };
  error?: string;
}

export interface EscrowInfoResponse {
  success: boolean;
  data?: {
    escrowInfo: Record<string, unknown>;
    owner: string;
    sequence: number;
  };
  error?: string;
}

/**
 * MPT 토큰 에스크로 생성
 */
export async function createMPTEscrow(request: Omit<EscrowCreateRequest, 'type' | 'issuanceId'> & { issuanceId: string }): Promise<EscrowCreateResponse> {
  try {
    const response = await fetch('/api/escrow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        type: 'mpt'
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MPT 에스크로 생성 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * IOU 토큰 에스크로 생성
 */
export async function createIOUEscrow(request: Omit<EscrowCreateRequest, 'type' | 'currency' | 'issuer'> & { currency: string; issuer: string }): Promise<EscrowCreateResponse> {
  try {
    const response = await fetch('/api/escrow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        type: 'iou'
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('IOU 에스크로 생성 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * 에스크로 해제
 */
export async function finishEscrow(request: EscrowFinishRequest): Promise<EscrowActionResponse> {
  try {
    const response = await fetch('/api/escrow/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('에스크로 해제 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * 에스크로 취소
 */
export async function cancelEscrow(request: EscrowCancelRequest): Promise<EscrowActionResponse> {
  try {
    const response = await fetch('/api/escrow/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('에스크로 취소 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * 에스크로 정보 조회
 */
export async function getEscrowInfo(request: EscrowInfoRequest): Promise<EscrowInfoResponse> {
  try {
    const params = new URLSearchParams({
      ownerAddress: request.ownerAddress,
      offerSequence: request.offerSequence.toString(),
      adminSeed: request.adminSeed,
      userSeed: request.userSeed,
      user2Seed: request.user2Seed
    });

    const response = await fetch(`/api/escrow/info?${params}`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('에스크로 정보 조회 API 호출 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}