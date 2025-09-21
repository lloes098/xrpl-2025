import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'xrpl'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const issuanceId = searchParams.get('issuanceId')
    
    if (!issuanceId) {
      return NextResponse.json(
        { success: false, error: 'IssuanceId is required' },
        { status: 400 }
      )
    }

    const client = new Client("wss://s.devnet.rippletest.net:51233")
    
    try {
      await client.connect()
      
      // MPT 발행 정보 조회 (account_objects 사용)
      const response = await client.request({
        command: "account_objects",
        account: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH", // 관리자 계정
        type: "mpt_issuance",
        limit: 400
      })
      
      await client.disconnect()
      
      // MPT 발행 정보 찾기
      const mptIssuance = (response.result.account_objects as any[])?.find((obj: any) => 
        obj.MPTokenIssuanceID === issuanceId
      )
      
      if (mptIssuance) {
        let metadata = {}
        let details = {}
        
        // 메타데이터 파싱
        if (mptIssuance.MPTokenMetadata) {
          try {
            const metadataHex = mptIssuance.MPTokenMetadata
            const metadataJson = Buffer.from(metadataHex, 'hex').toString('utf8')
            metadata = JSON.parse(metadataJson)
            
            // details 필드가 있으면 파싱
            if (metadata.details) {
              try {
                details = JSON.parse(metadata.details)
              } catch (error) {
                console.warn('details 파싱 실패:', error)
              }
            }
          } catch (error) {
            console.warn('메타데이터 파싱 실패:', error)
          }
        }
        
        return NextResponse.json({
          success: true,
          data: {
            issuanceId,
            metadata: {
              ...metadata,
              details: details
            },
            mptData: mptIssuance,
            owner: mptIssuance.Account,
            issuer: mptIssuance.Account,
            assetScale: mptIssuance.AssetScale,
            maximumAmount: mptIssuance.MaximumAmount
          }
        })
      } else {
        return NextResponse.json(
          { success: false, error: 'MPT not found' },
          { status: 404 }
        )
      }
      
    } catch (error) {
      await client.disconnect()
      throw error
    }
    
  } catch (error) {
    console.error('MPT 정보 조회 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
