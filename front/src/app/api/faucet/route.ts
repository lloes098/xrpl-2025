import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network = 'testnet' } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (network !== 'testnet') {
      return NextResponse.json(
        { success: false, error: 'Faucet is only available for testnet' },
        { status: 400 }
      );
    }

    // XRPL testnet faucet URL
    const faucetUrl = 'https://faucet.altnet.rippletest.net/accounts';
    
    const response = await fetch(faucetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: address,
        xrpAmount: '1000' // 1000 XRP for testing
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to request from faucet' },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test XRP requested successfully',
      data: result
    });

  } catch (error) {
    console.error('Faucet error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
