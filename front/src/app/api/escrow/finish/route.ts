import { NextRequest, NextResponse } from 'next/server'
import { TokenEscrowManager } from 'xrpl-core/src/services/escrow/TokenEscrowManager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ownerAddress,
      offerSequence,
      finisherSeed,
      fulfillment, // 조건부 에스크로의 경우
      adminSeed,
      userSeed,
      user2Seed
    } = body

    // TokenEscrowManager 초기화
    const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed)
    
    try {
      await escrowManager.connect()
      
      const result = await escrowManager.finishEscrow(
        ownerAddress,
        offerSequence,
        finisherSeed,
        fulfillment
      )
      
      await escrowManager.disconnect()
      
      return NextResponse.json({
        success: true,
        data: {
          transactionResult: result,
          escrowInfo: {
            owner: ownerAddress,
            sequence: offerSequence,
            action: 'finished',
            timestamp: new Date().toISOString()
          }
        }
      })
      
    } catch (error) {
      await escrowManager.disconnect()
      throw error
    }
    
  } catch (error) {
    console.error('에스크로 해제 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}