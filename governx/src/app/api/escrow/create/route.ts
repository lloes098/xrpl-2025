import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      creatorSeed, 
      destination, 
      amount, 
      currency = "XRP", 
      tokenIssuer, 
      finishAfterDays = 30, 
      cancelAfterDays = 60,
      network = 'testnet'
    } = body;

    // 필수 파라미터 검증
    if (!creatorSeed || !destination || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: creatorSeed, destination, amount' },
        { status: 400 }
      );
    }

    // 에스크로 생성 (동적 import 사용)
    const { createProjectEscrow } = await import('@/lib/xrpl');
    const result = await createProjectEscrow(
      creatorSeed,
      destination,
      amount,
      currency,
      tokenIssuer,
      finishAfterDays,
      cancelAfterDays,
      network
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        sequence: result.sequence,
        message: 'Escrow created successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Escrow creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
