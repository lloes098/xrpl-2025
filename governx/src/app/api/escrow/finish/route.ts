import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      finisherSeed, 
      ownerAddress, 
      offerSequence, 
      network = 'testnet',
      autoFinish = false
    } = body;

    // 필수 파라미터 검증
    if (!finisherSeed || !ownerAddress || !offerSequence) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: finisherSeed, ownerAddress, offerSequence' },
        { status: 400 }
      );
    }

    // 동적 import 사용
    const { releaseProjectFunds, autoFinishEscrow } = await import('@/lib/xrpl');
    
    let result;

    if (autoFinish) {
      // 자동 해제 (조건 확인 후)
      result = await autoFinishEscrow(
        finisherSeed,
        ownerAddress,
        offerSequence,
        network
      );
    } else {
      // 수동 해제
      result = await releaseProjectFunds(
        finisherSeed,
        ownerAddress,
        offerSequence,
        network
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        message: autoFinish ? 'Escrow auto-finished successfully' : 'Escrow finished successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Escrow finish error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
