import { NextRequest, NextResponse } from 'next/server'
import { MPTokenManager } from 'xrpl-core/src/services/mpt/MPTokenManager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      projectData, 
      adminSeed, 
      userSeed,
      assetScale = 0,
      maximumAmount = "1000000000"
    } = body

    // 프로젝트 데이터를 MPT 메타데이터로 변환 (XLS-89d 표준 준수: 최대 9개 필드)
    const mptMetadata = {
      // 필수 필드들 (9개 이하로 제한)
      name: projectData.title || 'Untitled Project',
      description: projectData.description || 'No description provided',
      projectId: projectData.id || `project_${Date.now()}`,
      creator: projectData.creator || '',
      category: projectData.category || 'General',
      website: projectData.website || '',
      logo: projectData.logo || '',
      // 추가 정보를 JSON 문자열로 압축
      details: JSON.stringify({
        totalSupply: parseInt(maximumAmount),
        targetAmount: projectData.targetAmount || 10000,
        tags: projectData.tags || [],
        socialLinks: {
          twitter: projectData.socialLinks?.twitter || '',
          discord: projectData.socialLinks?.discord || '',
          github: projectData.socialLinks?.github || ''
        },
        startDate: projectData.startDate || new Date().toISOString(),
        endDate: projectData.endDate || '',
        status: 'active',
        fundingGoal: projectData.fundingGoal || 0,
        currentFunding: 0,
        backers: 0,
        blockchain: 'XRPL',
        tokenType: 'MPT',
        network: 'devnet'
      })
    }

    // MPT 토큰 매니저 초기화
    const mptManager = new MPTokenManager(adminSeed, userSeed)
    
    try {
      await mptManager.connect()
      
      const flags = {
        tfMPTCanTransfer: true,
        tfMPTCanEscrow: true,
        tfMPTRequireAuth: false,
        tfMPTCanTrade: true,
        tfMPTCanLock: true
      }
      
      // MPT 토큰 발행
      const result = await mptManager.createIssuance(
        assetScale,
        maximumAmount,
        flags,
        JSON.stringify(mptMetadata)
      )
      
      await mptManager.disconnect()
      
      return NextResponse.json({
        success: true,
        data: {
          issuanceId: result.issuanceId,
          transactionResult: result.result,
          metadata: mptMetadata,
          projectId: mptMetadata.projectId
        }
      })
      
    } catch (error) {
      await mptManager.disconnect()
      throw error
    }
    
  } catch (error) {
    console.error('MPT 토큰 생성 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
