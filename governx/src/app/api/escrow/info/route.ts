import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('ownerAddress');
    const offerSequence = searchParams.get('offerSequence');
    const network = searchParams.get('network') || 'testnet';

    // 필수 파라미터 검증
    if (!ownerAddress || !offerSequence) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: ownerAddress, offerSequence' },
        { status: 400 }
      );
    }

    const sequence = parseInt(offerSequence);
    if (isNaN(sequence)) {
      return NextResponse.json(
        { success: false, error: 'Invalid offerSequence: must be a number' },
        { status: 400 }
      );
    }

    // 에스크로 정보 조회 (동적 import 사용)
    const { EscrowManager } = await import('@/lib/xrpl/features/escrow');
    const escrowManager = new EscrowManager(network as 'testnet' | 'mainnet');
    const escrowInfo = await escrowManager.getEscrowInfo(ownerAddress, sequence);

    if (escrowInfo) {
      return NextResponse.json({
        success: true,
        data: {
          owner: escrowInfo.owner,
          sequence: escrowInfo.sequence,
          destination: escrowInfo.destination,
          amount: escrowInfo.amount,
          finishAfter: escrowInfo.finishAfter,
          cancelAfter: escrowInfo.cancelAfter,
          condition: escrowInfo.condition
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Escrow not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Escrow info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
