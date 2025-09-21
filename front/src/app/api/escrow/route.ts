import { NextRequest, NextResponse } from 'next/server';

// API 라우트 정보 제공
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Escrow API Endpoints',
    version: '1.0.0',
    endpoints: {
      'POST /api/escrow/create': {
        description: 'Create a new escrow',
        parameters: {
          creatorSeed: 'string (required)',
          destination: 'string (required)', 
          amount: 'number (required)',
          currency: 'string (optional, default: XRP)',
          tokenIssuer: 'string (optional)',
          finishAfterDays: 'number (optional, default: 30)',
          cancelAfterDays: 'number (optional, default: 60)',
          network: 'string (optional, default: testnet)'
        }
      },
      'POST /api/escrow/finish': {
        description: 'Finish (release) an escrow',
        parameters: {
          finisherSeed: 'string (required)',
          ownerAddress: 'string (required)',
          offerSequence: 'number (required)',
          network: 'string (optional, default: testnet)',
          autoFinish: 'boolean (optional, default: false)'
        }
      },
      'POST /api/escrow/cancel': {
        description: 'Cancel an escrow',
        parameters: {
          cancelerSeed: 'string (required)',
          ownerAddress: 'string (required)',
          offerSequence: 'number (required)',
          network: 'string (optional, default: testnet)',
          autoCancel: 'boolean (optional, default: false)'
        }
      },
      'GET /api/escrow/info': {
        description: 'Get escrow information',
        parameters: {
          ownerAddress: 'string (required)',
          offerSequence: 'number (required)',
          network: 'string (optional, default: testnet)'
        }
      },
      'GET /api/escrow/status': {
        description: 'Get escrow status and conditions',
        parameters: {
          ownerAddress: 'string (required)',
          offerSequence: 'number (required)',
          network: 'string (optional, default: testnet)'
        }
      }
    }
  });
}
