import { Client, Wallet } from 'xrpl';
import { EscrowData, EscrowResult, ReleaseResult, ValidationResult } from '../../types';
import { TRANSACTION_TYPES, ESCROW_STATUS } from '../../config/constants';
import * as crypto from 'crypto';
import * as cc from 'five-bells-condition';

/**
 * 토큰 에스크로 관리 서비스
 * 투자금을 조건부로 보관하고 마일스톤 달성 시 해제
 */
export class TokenEscrowManager {
  private client: Client;
  private escrows: Map<string, EscrowData> = new Map();

  constructor(xrplClient: Client) {
    this.client = xrplClient;
  }

  /**
   * 투자금 에스크로 생성
   * @param escrowData - 에스크로 데이터
   * @returns 에스크로 생성 결과
   */
  async createInvestmentEscrow(escrowData: EscrowData): Promise<EscrowResult> {
    try {
      // 1. 크립토 조건 생성 (마일스톤 기반)
      const condition = this.generateCryptoCondition(escrowData.milestoneId || 'default');
      
      // 2. 에스크로 생성 트랜잭션 구성 (최신 API)
      const escrowTx = {
        TransactionType: "EscrowCreate",
        Account: escrowData.investorAddress,
        Destination: escrowData.projectWallet || escrowData.investorAddress,
        Amount: this.xrpToDrops(escrowData.rlusdAmount.toString()),
        Condition: condition.conditionHex,
        FinishAfter: this.dateToRippleTime(escrowData.deadline)
      };

      // 3. 트랜잭션 검증
      this.validateEscrowTransaction(escrowTx);

      // 4. 투자자 지갑으로 서명 및 제출
      const investorWallet = Wallet.fromSeed(escrowData.investorSeed || '');
      const result = await this.submitTransaction(escrowTx, investorWallet);

      if (result.success) {
        // 5. 에스크로 데이터 저장
        const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const savedEscrow: EscrowData = {
          ...escrowData,
          id: escrowId,
          condition: condition.conditionHex,
          fulfillment: condition.fulfillmentHex,
          escrowSequence: result.sequence,
          status: ESCROW_STATUS['ACTIVE'],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.escrows.set(escrowId, savedEscrow);

        console.log(`✅ Investment escrow created: ${escrowId}`);
        return {
          success: true,
          escrowId,
          txHash: result.hash,
          escrowSequence: result.sequence,
          condition: condition.conditionHex,
          fulfillment: condition.fulfillmentHex
        };
      } else {
        throw new Error('Failed to create escrow transaction');
      }
    } catch (error) {
      console.error('❌ Escrow creation failed:', error);
      return {
        success: false,
        message: `Escrow creation failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 에스크로 해제 (마일스톤 달성 시)
   * @param escrowId - 에스크로 ID
   * @param milestoneEvidence - 마일스톤 달성 증거
   * @returns 에스크로 해제 결과
   */
  async releaseEscrow(escrowId: string, milestoneEvidence: any): Promise<ReleaseResult> {
    try {
      const escrowData = this.escrows.get(escrowId);
      if (!escrowData) {
        throw new Error(`Escrow not found: ${escrowId}`);
      }

      // 1. 마일스톤 검증
      const isValidMilestone = await this.verifyMilestoneAchievement(escrowData, milestoneEvidence);
      if (!isValidMilestone) {
        throw new Error('Milestone verification failed');
      }

      // 2. 에스크로 해제 트랜잭션 구성
      const finishTx = {
        TransactionType: TRANSACTION_TYPES.ESCROW_FINISH,
        Account: escrowData.investorAddress,
        Owner: escrowData.investorAddress,
        OfferSequence: escrowData.escrowSequence,
        Condition: escrowData.condition,
        Fulfillment: escrowData.fulfillment,
        Fee: '12'
      };

      // 3. 트랜잭션 검증
      this.validateEscrowFinishTransaction(finishTx);

      // 4. 투자자 지갑으로 서명 및 제출
      const investorWallet = Wallet.fromSeed(escrowData.investorSeed || '');
      const result = await this.submitTransaction(finishTx, investorWallet);

      if (result.success) {
        // 5. 에스크로 상태 업데이트
        escrowData.status = ESCROW_STATUS['FINISHED'];
        escrowData.updatedAt = new Date();
        this.escrows.set(escrowId, escrowData);

        console.log(`✅ Escrow released: ${escrowId}`);
        return {
          success: true,
          message: 'Escrow successfully released',
          txHash: result.hash
        };
      } else {
        throw new Error('Failed to release escrow');
      }
    } catch (error) {
      console.error('❌ Escrow release failed:', error);
      return {
        success: false,
        message: `Escrow release failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 에스크로 취소 (시간 초과 또는 프로젝트 실패 시)
   * @param escrowId - 에스크로 ID
   * @param reason - 취소 사유
   * @returns 에스크로 취소 결과
   */
  async cancelEscrow(escrowId: string, reason: string): Promise<ReleaseResult> {
    try {
      const escrowData = this.escrows.get(escrowId);
      if (!escrowData) {
        throw new Error(`Escrow not found: ${escrowId}`);
      }

      // 1. 에스크로 취소 트랜잭션 구성
      const cancelTx = {
        TransactionType: TRANSACTION_TYPES.ESCROW_CANCEL,
        Account: escrowData.investorAddress,
        Owner: escrowData.investorAddress,
        OfferSequence: escrowData.escrowSequence,
        Fee: '12'
      };

      // 2. 투자자 지갑으로 서명 및 제출
      const investorWallet = Wallet.fromSeed(escrowData.investorSeed || '');
      const result = await this.submitTransaction(cancelTx, investorWallet);

      if (result.success) {
        // 3. 에스크로 상태 업데이트
        escrowData.status = ESCROW_STATUS['CANCELLED'];
        escrowData.updatedAt = new Date();
        this.escrows.set(escrowId, escrowData);

        console.log(`✅ Escrow cancelled: ${escrowId} - ${reason}`);
        return {
          success: true,
          message: `Escrow cancelled: ${reason}`,
          txHash: result.hash
        };
      } else {
        throw new Error('Failed to cancel escrow');
      }
    } catch (error) {
      console.error('❌ Escrow cancellation failed:', error);
      return {
        success: false,
        message: `Escrow cancellation failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 에스크로 정보 조회
   * @param escrowId - 에스크로 ID
   * @returns 에스크로 데이터
   */
  getEscrow(escrowId: string): EscrowData | undefined {
    return this.escrows.get(escrowId);
  }

  /**
   * 프로젝트별 에스크로 목록 조회
   * @param projectId - 프로젝트 ID
   * @returns 에스크로 목록
   */
  getEscrowsByProject(projectId: string): EscrowData[] {
    return Array.from(this.escrows.values()).filter(escrow => escrow.projectId === projectId);
  }

  /**
   * 크립토 조건 생성
   * @param milestoneId - 마일스톤 ID
   * @returns 크립토 조건과 fulfillment
   */
  private generateCryptoCondition(milestoneId: string): { conditionHex: string; fulfillmentHex: string } {
    const preimageData = crypto.randomBytes(32);
    const fulfillment = new cc.PreimageSha256();
    fulfillment.setPreimage(preimageData);
    
    return {
      conditionHex: fulfillment.getConditionBinary().toString('hex').toUpperCase(),
      fulfillmentHex: fulfillment.serializeBinary().toString('hex').toUpperCase()
    };
  }

  /**
   * 마일스톤 달성 검증
   * @param escrowData - 에스크로 데이터
   * @param evidence - 달성 증거
   * @returns 검증 결과
   */
  private async verifyMilestoneAchievement(escrowData: EscrowData, evidence: any): Promise<boolean> {
    // 실제 구현에서는 더 정교한 검증 로직 필요
    // 예: GitHub 커밋 확인, 외부 API 검증, 전문가 검토 등
    
    if (!evidence || !evidence.type) {
      return false;
    }

    switch (evidence.type) {
      case 'github_repository':
        return this.verifyGitHubEvidence(evidence);
      case 'external_verification':
        return this.verifyExternalEvidence(evidence);
      case 'manual_approval':
        return this.verifyManualApproval(evidence);
      default:
        return false;
    }
  }

  /**
   * GitHub 증거 검증
   * @param evidence - GitHub 증거
   * @returns 검증 결과
   */
  private async verifyGitHubEvidence(evidence: any): Promise<boolean> {
    // 실제 구현에서는 GitHub API를 통해 커밋, PR, 이슈 등을 검증
    console.log(`🔍 Verifying GitHub evidence: ${evidence.url}`);
    return true; // 임시로 항상 성공
  }

  /**
   * 외부 검증 서비스 증거 검증
   * @param evidence - 외부 증거
   * @returns 검증 결과
   */
  private async verifyExternalEvidence(evidence: any): Promise<boolean> {
    // 실제 구현에서는 외부 검증 서비스 API 호출
    console.log(`🔍 Verifying external evidence: ${evidence.service}`);
    return true; // 임시로 항상 성공
  }

  /**
   * 수동 승인 검증
   * @param evidence - 수동 승인 증거
   * @returns 검증 결과
   */
  private async verifyManualApproval(evidence: any): Promise<boolean> {
    // 실제 구현에서는 관리자 승인 시스템과 연동
    console.log(`🔍 Verifying manual approval: ${evidence.approverId}`);
    return true; // 임시로 항상 성공
  }

  /**
   * 에스크로 트랜잭션 검증
   * @param tx - 트랜잭션 데이터
   */
  private validateEscrowTransaction(tx: any): void {
    if (!tx.Account || !tx.Destination || !tx.Amount) {
      throw new Error('Invalid escrow transaction: missing required fields');
    }
  }

  /**
   * 에스크로 해제 트랜잭션 검증
   * @param tx - 트랜잭션 데이터
   */
  private validateEscrowFinishTransaction(tx: any): void {
    if (!tx.Account || !tx.Owner || !tx.OfferSequence) {
      throw new Error('Invalid escrow finish transaction: missing required fields');
    }
  }

  /**
   * 트랜잭션 제출
   * @param tx - 트랜잭션 데이터
   * @param wallet - 서명할 지갑
   * @returns 제출 결과
   */
  private async submitTransaction(tx: any, wallet: Wallet): Promise<any> {
    try {
      const signedTx = wallet.sign(tx);
      const result = await this.client.submitAndWait(signedTx.tx_blob);
      
      if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
        const meta = result.result.meta as any;
        if (meta.TransactionResult === 'tesSUCCESS') {
          return {
            success: true,
            hash: result.result.hash,
            sequence: (result.result as any).tx_json?.Sequence || 0,
            result: result.result
          };
        } else {
          throw new Error(`Transaction failed: ${meta.TransactionResult}`);
        }
      } else {
        throw new Error('Invalid transaction result format');
      }
    } catch (error) {
      console.error('Transaction submission failed:', error);
      throw error;
    }
  }

  /**
   * XRP를 드롭으로 변환
   * @param xrp - XRP 양
   * @returns 드롭 양
   */
  private xrpToDrops(xrp: string): string {
    return (parseFloat(xrp) * 1_000_000).toString();
  }

  /**
   * 날짜를 Ripple 시간으로 변환
   * @param date - 날짜
   * @returns Ripple 시간
   */
  private dateToRippleTime(date: Date): number {
    return Math.floor(date.getTime() / 1000) + 946684800; // Unix epoch + Ripple epoch offset
  }
}
