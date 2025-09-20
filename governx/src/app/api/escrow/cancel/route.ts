import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      cancelerSeed, 
      ownerAddress, 
      offerSequence, 
      network = 'testnet',
      autoCancel = false
    } = body;

    // 필수 파라미터 검증
    if (!cancelerSeed || !ownerAddress || !offerSequence) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: cancelerSeed, ownerAddress, offerSequence' },
        { status: 400 }
      );
    }

    // 동적 import 사용
    const { refundProjectFunds, autoCancelEscrow } = await import('@/lib/xrpl');
    
    let result;

    if (autoCancel) {
      // 자동 취소 (조건 확인 후)
      result = await autoCancelEscrow(
        cancelerSeed,
        ownerAddress,
        offerSequence,
        network
      );
    } else {
      // 수동 취소
      result = await refundProjectFunds(
        cancelerSeed,
        ownerAddress,
        offerSequence,
        network
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        message: autoCancel ? 'Escrow auto-cancelled successfully' : 'Escrow cancelled successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Escrow cancel error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
