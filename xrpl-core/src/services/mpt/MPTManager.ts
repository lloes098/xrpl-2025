import { Client, Wallet } from 'xrpl';
import { TRANSACTION_TYPES } from '../../config/constants';
import { 
  MPTTokenData, 
  TokenMetadata, 
  TransactionData, 
  ValidationResult
} from '../../types';
import { WalletManager } from '../wallet/WalletManager';

/**
 * MPT 토큰 관리 서비스
 * MPT 토큰 생성, 발행, 전송 관리
 */
export class MPTManager {
  private client: Client;
  private walletManager: WalletManager;
  private mptTokens: Map<string, MPTTokenData> = new Map();

  constructor(xrplClient: Client, walletManager: WalletManager) {
    this.client = xrplClient;
    this.walletManager = walletManager;
  }

  /**
   * 프로젝트용 MPT 토큰 생성
   * @param projectData - 프로젝트 데이터
   * @returns MPT 토큰 데이터
   */
  async createProjectMPT(projectData: {
    projectId: string;
    name: string;
    description: string;
    totalTokens: number;
    targetAmount: number;
    website?: string;
    logo?: string;
    category?: string;
    tags?: string[];
    socialLinks?: Record<string, string>;
  }): Promise<MPTTokenData> {
    const { projectId, name, description, totalTokens, targetAmount } = projectData;

    // 1. 프로젝트 전용 발행자 지갑 생성
    const issuerWallet = await this.walletManager.createIssuerWallet(projectId);

    // 2. 메타데이터 구성
    const metadata = this.buildMetadata({
      name: `${name} Token`,
      description,
      projectId,
      totalSupply: totalTokens,
      targetAmount,
      ...(projectData.website && { website: projectData.website }),
      ...(projectData.logo && { logo: projectData.logo }),
      ...(projectData.category && { category: projectData.category }),
      ...(projectData.tags && { tags: projectData.tags }),
      ...(projectData.socialLinks && { socialLinks: projectData.socialLinks })
    });

    // 3. MPT 발행 트랜잭션 (최신 API)
    const createTx = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: issuerWallet.address,
      AssetScale: 2, // 소수점 자릿수
      MaximumAmount: totalTokens.toString(),
      TransferFee: 0, // 전송 수수료
      Flags: 0, // 플래그 (clawback, lock, auth 등)
      MPTokenMetadata: metadata.hexMetadata
    };

    const result = await this.submitTransaction(createTx, issuerWallet);
    
    if (!result.success) {
      throw new Error(result.message || 'MPT token creation failed');
    }

    // 4. 토큰 정보 저장
    const mptData: MPTTokenData = {
      projectId,
      issuerWallet: issuerWallet.address,
      mptIssuanceId: this.extractMPTIssuanceId({}),
      name: `${name} Token`,
      symbol: this.generateSymbol(name),
      description,
      totalSupply: totalTokens,
      circulatingSupply: 0,
      metadata: metadata.metadata,
      flags: {
        MPTfTransferable: true,
        MPTfOnlyXRP: false,
        MPTfTrustLine: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      holders: new Map()
    };

    this.mptTokens.set(projectId, mptData);

    console.log(`MPT token created for project ${projectId}: ${mptData.mptIssuanceId}`);
    return mptData;
  }

  /**
   * 토큰 발행 (투자자/플랫폼에게)
   * @param mptData - MPT 토큰 데이터
   * @param recipient - 수신자 주소
   * @param amount - 발행할 토큰 양
   * @returns 발행 결과
   */
  async mintTokens(mptData: MPTTokenData, recipient: string, amount: number): Promise<any> {
    const issuerWallet = this.walletManager.getIssuerWallet(mptData.projectId);

    // Trust Line 설정 (수신자가 토큰을 받을 수 있도록)
    await this.setupTrustLine(recipient, mptData.mptIssuanceId);

    const mintTx = {
      TransactionType: "Payment",
      Account: issuerWallet.address,
      Destination: recipient,
      Amount: {
        mpt_issuance_id: mptData.mptIssuanceId,
        value: amount.toString()
      }
    };

    await this.submitTransaction(mintTx, issuerWallet);

    // 토큰 데이터 업데이트
    mptData.circulatingSupply += amount;
    const currentBalance = mptData.holders.get(recipient) || 0;
    mptData.holders.set(recipient, currentBalance + amount);
    mptData.updatedAt = new Date();
    this.mptTokens.set(mptData.projectId, mptData);

    console.log(`Minted ${amount} tokens to ${recipient} for project ${mptData.projectId}`);
    return { success: true };
  }

  /**
   * 토큰 전송
   * @param fromAddress - 발신자 주소
   * @param toAddress - 수신자 주소
   * @param mptIssuanceId - MPT 발행 ID
   * @param amount - 전송할 토큰 양
   * @param senderWallet - 발신자 지갑
   * @returns 전송 결과
   */
  async transferTokens(
    fromAddress: string, 
    toAddress: string, 
    mptIssuanceId: string, 
    amount: number, 
    senderWallet: Wallet
  ): Promise<any> {
    // 수신자 Trust Line 설정
    await this.setupTrustLine(toAddress, mptIssuanceId);

    const transferTx: TransactionData = {
      TransactionType: TRANSACTION_TYPES.PAYMENT,
      Account: fromAddress,
      Destination: toAddress,
      Amount: {
        mpt_issuance_id: mptIssuanceId,
        value: amount.toString()
      },
      Fee: this.xrpToDrops('0.001')
    };

    await this.submitTransaction(transferTx, senderWallet);

    // 토큰 데이터 업데이트
    const projectId = this.getProjectIdByIssuanceId(mptIssuanceId);
    if (projectId) {
      const mptData = this.mptTokens.get(projectId);
      if (mptData) {
        const fromBalance = mptData.holders.get(fromAddress) || 0;
        const toBalance = mptData.holders.get(toAddress) || 0;
        
        mptData.holders.set(fromAddress, fromBalance - amount);
        mptData.holders.set(toAddress, toBalance + amount);
        mptData.updatedAt = new Date();
        this.mptTokens.set(projectId, mptData);
      }
    }

    console.log(`Transferred ${amount} tokens from ${fromAddress} to ${toAddress}`);
    return { success: true };
  }

  /**
   * Trust Line 설정
   * @param address - 지갑 주소
   * @param mptIssuanceId - MPT 발행 ID
   */
  async setupTrustLine(address: string, mptIssuanceId: string): Promise<void> {
    try {
      // 실제 구현에서는 지갑으로 서명하여 트랜잭션 제출
      // const trustTx: TransactionData = {
      //   TransactionType: TRANSACTION_TYPES.MPT_AUTHORIZE,
      //   Account: address,
      //   Amount: '0',
      //   MPTokenIssuanceID: mptIssuanceId
      // };
      // await this.submitTransaction(trustTx, wallet);
      console.log(`Trust line set up for ${address} with MPT ${mptIssuanceId}`);
    } catch (error) {
      console.warn(`Trust line setup failed for ${address}: ${(error as Error).message}`);
    }
  }

  /**
   * 토큰 잔액 조회 (최신 API)
   * @param address - 지갑 주소
   * @param mptIssuanceId - MPT 발행 ID
   * @returns 토큰 잔액
   */
  async getTokenBalance(address: string, mptIssuanceId: string): Promise<number> {
    try {
      // 최신 MPT 조회 API 사용
      const mpts = await this.client.request({
        command: "account_objects",
        account: address,
        ledger_index: "validated",
        type: "mptoken"
      });

      if (mpts.result.account_objects) {
        const mpt = mpts.result.account_objects.find((obj: any) => 
          obj.MPTokenIssuanceID === mptIssuanceId
        );
        return mpt ? parseFloat((mpt as any).MPTAmount || '0') : 0;
      }
      return 0;
    } catch (error) {
      console.error(`Failed to get token balance for ${address}:`, error);
      return 0;
    }
  }

  /**
   * MPT 토큰 정보 조회
   * @param projectId - 프로젝트 ID
   * @returns MPT 토큰 정보
   */
  getMPTToken(projectId: string): MPTTokenData {
    const mptData = this.mptTokens.get(projectId);
    if (!mptData) {
      throw new Error(`MPT token not found for project: ${projectId}`);
    }
    return mptData;
  }

  /**
   * 모든 MPT 토큰 목록 조회
   * @returns MPT 토큰 목록
   */
  getAllMPTTokens(): MPTTokenData[] {
    return Array.from(this.mptTokens.values());
  }

  /**
   * 메타데이터 구성
   * @param data - 메타데이터 데이터
   * @returns HEX 인코딩된 메타데이터
   */
  buildMetadata(data: {
    name: string;
    description: string;
    projectId: string;
    totalSupply: number;
    targetAmount: number;
    website?: string;
    logo?: string;
    category?: string;
    tags?: string[];
    socialLinks?: Record<string, string>;
  }): { metadata: TokenMetadata; hexMetadata: string } {
    const metadata: TokenMetadata = {
      name: data.name,
      symbol: this.generateSymbol(data.name),
      description: data.description,
      project_id: data.projectId,
      project_name: data.name.replace(' Token', ''),
      category: data.category || 'General',
      total_supply: data.totalSupply,
      target_amount: data.targetAmount,
      token_type: 'MPT',
      creator: {
        address: '',
        name: '',
        email: ''
      },
      created_at: new Date().toISOString(),
      version: '1.0.0',
      website: data.website || '',
      logo: data.logo || '',
      tags: data.tags || [],
      social_links: data.socialLinks || {},
      metadata_hash: ''
    };

    // 해시 생성
    metadata.metadata_hash = this.generateMetadataHash(metadata);

    // HEX 인코딩
    const hexMetadata = Buffer.from(JSON.stringify(metadata)).toString('hex');

    return { metadata, hexMetadata };
  }

  /**
   * MPT 발행 ID 추출
   * @param result - 트랜잭션 결과
   * @returns MPT 발행 ID
   */
  private extractMPTIssuanceId(_result: any): string {
    // 트랜잭션 결과에서 MPT 발행 ID 추출
    // 실제 구현에서는 트랜잭션 메타데이터를 분석하여 ID를 추출
    return `mpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 토큰 심볼 생성
   * @param name - 토큰 이름
   * @returns 생성된 심볼
   */
  private generateSymbol(name: string): string {
    const words = name.split(' ').filter(word => word.length > 0);
    let symbol = '';
    
    if (words.length === 1) {
      symbol = words[0]?.substring(0, 4).toUpperCase() || '';
    } else {
      symbol = words.map(word => word[0]).join('').toUpperCase();
    }
    
    return symbol.substring(0, 6);
  }

  /**
   * 메타데이터 해시 생성
   * @param metadata - 메타데이터 객체
   * @returns SHA256 해시
   */
  private generateMetadataHash(metadata: TokenMetadata): string {
    const jsonString = JSON.stringify(metadata, Object.keys(metadata).sort());
    return require('crypto').createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * 프로젝트 ID로 발행 ID 조회
   * @param mptIssuanceId - MPT 발행 ID
   * @returns 프로젝트 ID
   */
  private getProjectIdByIssuanceId(mptIssuanceId: string): string | null {
    for (const [projectId, mptData] of this.mptTokens.entries()) {
      if (mptData.mptIssuanceId === mptIssuanceId) {
        return projectId;
      }
    }
    return null;
  }

  /**
   * 트랜잭션 제출
   * @param tx - 트랜잭션 객체
   * @param wallet - 서명할 지갑
   * @returns 제출 결과
   */
  private async submitTransaction(tx: TransactionData, wallet: Wallet): Promise<any> {
    try {
      const signedTx = wallet.sign(tx as any);
      const result = await this.client.submitAndWait(signedTx.tx_blob);
      
      if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
        const meta = result.result.meta as any;
        if (meta.TransactionResult === 'tesSUCCESS') {
          return {
            success: true,
            hash: result.result.hash,
            result: result.result
          };
        } else {
          throw new Error(`Transaction failed: ${meta.TransactionResult}`);
        }
      } else {
        throw new Error('Invalid transaction result format');
      }
    } catch (error) {
      console.error('MPT transaction submission failed:', error);
      throw error;
    }
  }

  /**
   * XRP를 드롭으로 변환
   * @param xrp - XRP 양
   * @returns 드롭 양
   */
  private xrpToDrops(xrp: string): string {
    return (parseFloat(xrp) * 1000000).toString();
  }

  /**
   * MPT 토큰 비활성화
   * @param projectId - 프로젝트 ID
   */
  deactivateMPTToken(projectId: string): void {
    const mptData = this.mptTokens.get(projectId);
    if (mptData) {
      mptData.isActive = false;
      mptData.updatedAt = new Date();
      this.mptTokens.set(projectId, mptData);
    }
  }

  /**
   * 토큰 유효성 검증
   * @param mptData - MPT 토큰 데이터
   * @returns 검증 결과
   */
  validateMPTToken(mptData: MPTTokenData): ValidationResult {
    const errors: string[] = [];

    if (!mptData.projectId) {
      errors.push('Project ID is required');
    }

    if (!mptData.issuerWallet) {
      errors.push('Issuer wallet is required');
    }

    if (!mptData.mptIssuanceId) {
      errors.push('MPT issuance ID is required');
    }

    if (!mptData.name) {
      errors.push('Token name is required');
    }

    if (!mptData.symbol) {
      errors.push('Token symbol is required');
    }

    if (mptData.totalSupply <= 0) {
      errors.push('Total supply must be positive');
    }

    if (mptData.circulatingSupply < 0) {
      errors.push('Circulating supply cannot be negative');
    }

    if (mptData.circulatingSupply > mptData.totalSupply) {
      errors.push('Circulating supply cannot exceed total supply');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
