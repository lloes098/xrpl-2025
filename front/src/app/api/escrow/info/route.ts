import { NextRequest, NextResponse } from 'next/server'
import { TokenEscrowManager } from 'xrpl-core/src/services/escrow/TokenEscrowManager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerAddress = searchParams.get('ownerAddress')
    const offerSequence = searchParams.get('offerSequence')
    const adminSeed = searchParams.get('adminSeed')
    const userSeed = searchParams.get('userSeed')
    const user2Seed = searchParams.get('user2Seed')
    
    if (!ownerAddress || !offerSequence || !adminSeed || !userSeed || !user2Seed) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // TokenEscrowManager 초기화
    const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed)
    
    try {
      await escrowManager.connect()
      
      const result = await escrowManager.getEscrowInfo(
        ownerAddress,
        parseInt(offerSequence)
      )
      
      await escrowManager.disconnect()
      
      if (result) {
        return NextResponse.json({
          success: true,
          data: {
            escrowInfo: result,
            owner: ownerAddress,
            sequence: parseInt(offerSequence)
          }
        })
      } else {
        return NextResponse.json(
          { success: false, error: 'Escrow not found' },
          { status: 404 }
        )
      }
      
    } catch (error) {
      await escrowManager.disconnect()
      throw error
    }
    
  } catch (error) {
    console.error('에스크로 정보 조회 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}