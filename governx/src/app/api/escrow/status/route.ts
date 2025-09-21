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

    // 에스크로 상태 조회 (동적 import 사용)
    const { EscrowCompletionManager } = await import('@/lib/xrpl/features/escrowCompletion');
    const completionManager = new EscrowCompletionManager(network as 'testnet' | 'mainnet');
    const escrowInfo = await completionManager.getEscrowInfo(ownerAddress, sequence);

    if (!escrowInfo) {
      return NextResponse.json(
        { success: false, error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // 상태 분석
    const now = Math.floor(Date.now() / 1000);
    const finishAfter = escrowInfo.finishAfter;
    const cancelAfter = escrowInfo.cancelAfter;

    let status = 'active';
    let canFinish = false;
    let canCancel = false;
    let reason = '';

    if (finishAfter && now >= finishAfter) {
      canFinish = true;
      status = 'ready_to_finish';
      reason = 'FinishAfter time has passed';
    }

    if (cancelAfter && now >= cancelAfter) {
      canCancel = true;
      if (!canFinish) {
        status = 'ready_to_cancel';
        reason = 'CancelAfter time has passed';
      }
    }

    if (finishAfter && cancelAfter) {
      if (now >= cancelAfter && !canFinish) {
        status = 'expired';
        reason = 'Escrow has expired and can only be cancelled';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        canFinish,
        canCancel,
        reason,
        escrowInfo: {
          owner: escrowInfo.owner,
          sequence: escrowInfo.sequence,
          destination: escrowInfo.destination,
          amount: escrowInfo.amount,
          finishAfter: escrowInfo.finishAfter,
          cancelAfter: escrowInfo.cancelAfter,
          condition: escrowInfo.condition,
          fulfillment: escrowInfo.fulfillment
        },
        timestamps: {
          current: now,
          finishAfter: finishAfter,
          cancelAfter: cancelAfter,
          finishAfterDate: finishAfter ? new Date((finishAfter + 946684800) * 1000).toISOString() : null,
          cancelAfterDate: cancelAfter ? new Date((cancelAfter + 946684800) * 1000).toISOString() : null
        }
      }
    });

  } catch (error) {
    console.error('Escrow status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
