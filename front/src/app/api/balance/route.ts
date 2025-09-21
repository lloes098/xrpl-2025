import { NextRequest, NextResponse } from 'next/server';
import { getAccountBalance } from '@/lib/xrpl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network') || 'testnet';

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    const balanceResult = await getAccountBalance(address, network as 'testnet' | 'mainnet');
    
    return NextResponse.json({
      success: true,
      balance: balanceResult.balance,
      error: balanceResult.error
    });

  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
