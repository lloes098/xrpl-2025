import { NextRequest, NextResponse } from 'next/server'
import { TokenEscrowManager } from 'xrpl-core/src/services/escrow/TokenEscrowManager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, // 'mpt' or 'iou'
      issuanceId, // MPT의 경우
      currency, // IOU의 경우
      issuer, // IOU의 경우
      value,
      destination,
      finishAfter, // 초 단위
      cancelAfter, // 초 단위
      condition, // 선택사항
      adminSeed,
      userSeed,
      user2Seed
    } = body

    // TokenEscrowManager 초기화
    const escrowManager = new TokenEscrowManager(adminSeed, userSeed, user2Seed)
    
    try {
      await escrowManager.connect()
      
      let result;
      
      if (type === 'mpt') {
        // MPT 토큰 에스크로 생성
        result = await escrowManager.createMPTEscrow(
          issuanceId,
          value,
          destination,
          finishAfter,
          cancelAfter,
          condition
        )
      } else if (type === 'iou') {
        // IOU 토큰 에스크로 생성
        result = await escrowManager.createIOUEscrow(
          currency,
          issuer,
          value,
          destination,
          finishAfter,
          cancelAfter,
          condition
        )
      } else {
        throw new Error('Invalid escrow type. Must be "mpt" or "iou"')
      }
      
      await escrowManager.disconnect()
      
      return NextResponse.json({
        success: true,
        data: {
          type,
          sequence: result.sequence,
          transactionResult: result.result,
          escrowInfo: {
            owner: type === 'mpt' ? escrowManager.getUserAddress() : escrowManager.getUserAddress(),
            destination,
            value,
            finishAfter: new Date(Date.now() + finishAfter * 1000).toISOString(),
            cancelAfter: new Date(Date.now() + cancelAfter * 1000).toISOString(),
            condition: condition || null
          }
        }
      })
      
    } catch (error) {
      await escrowManager.disconnect()
      throw error
    }
    
  } catch (error) {
    console.error('에스크로 생성 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}