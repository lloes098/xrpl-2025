import { Client, Wallet } from 'xrpl';
import { BatchTransactionData, BatchResult, TransactionData, BatchMode } from '../../types';
import { TRANSACTION_TYPES, BATCH_MODES } from '../../config/constants';

/**
 * 배치 트랜잭션 관리 서비스
 * 여러 XRPL 트랜잭션을 원자적으로 실행
 */
export class BatchManager {
  private client: Client;
  private batchHistory: Map<string, BatchResult> = new Map();

  constructor(xrplClient: Client) {
    this.client = xrplClient;
  }

  /**
   * 투자 배치 트랜잭션 실행
   * @param batchData - 배치 트랜잭션 데이터
   * @returns 배치 실행 결과
   */
  async executeInvestmentBatch(batchData: {
    investorWallet: Wallet;
    projectWallet: string;
    platformWallet: string;
    investmentAmount: number;
    platformFee: number;
    mptIssuanceId: string;
    tokenAmount: number;
    multiSigSigners?: Wallet[];
  }): Promise<BatchResult> {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. 내부 트랜잭션들 생성
      const innerTransactions = [
        this.createInnerPayment({
          from: batchData.investorWallet.address,
          to: batchData.platformWallet,
          amount: this.xrpToDrops(batchData.platformFee.toString()),
          description: 'Platform fee payment'
        }),
        this.createInnerPayment({
          from: batchData.investorWallet.address,
          to: batchData.projectWallet,
          amount: this.xrpToDrops(batchData.investmentAmount.toString()),
          description: 'Investment amount to project'
        }),
        this.createInnerTokenTransfer({
          from: batchData.investorWallet.address,
          to: batchData.investorWallet.address, // 투자자에게 토큰 발행
          mptIssuanceId: batchData.mptIssuanceId,
          amount: batchData.tokenAmount,
          description: 'MPT token issuance to investor'
        })
      ];

      // 2. 배치 트랜잭션 구성
      const batchTx = {
        TransactionType: TRANSACTION_TYPES.BATCH,
        Account: batchData.investorWallet.address,
        RawTransactions: innerTransactions,
        Flags: this.getBatchFlags(BATCH_MODES.ALL_OR_NOTHING),
        Fee: '15' // 배치 트랜잭션은 더 높은 수수료
      };

      // 3. 멀티시그 서명자 추가 (필요한 경우)
      if (batchData.multiSigSigners && batchData.multiSigSigners.length > 0) {
        batchTx.BatchSigners = batchData.multiSigSigners.map(signer => ({
          BatchSigner: {
            Account: signer.address,
            SigningPubKey: signer.publicKey
          }
        }));
      }

      // 4. 트랜잭션 검증
      this.validateBatchTransaction(batchTx);

      // 5. 배치 트랜잭션 제출
      const result = await this.submitBatchTransaction(batchTx, batchData.investorWallet);

      if (result.success) {
        // 6. 배치 결과 저장
        const batchResult: BatchResult = {
          success: true,
          hash: result.hash,
          result: result.result,
          batchId,
          innerTransactionCount: innerTransactions.length,
          totalAmount: batchData.investmentAmount + batchData.platformFee
        };

        this.batchHistory.set(batchId, batchResult);

        console.log(`✅ Investment batch executed: ${batchId}`);
        console.log(`   - Investment: ${batchData.investmentAmount} XRP`);
        console.log(`   - Platform Fee: ${batchData.platformFee} XRP`);
        console.log(`   - Tokens: ${batchData.tokenAmount} MPT`);
        console.log(`   - Hash: ${result.hash}`);

        return batchResult;
      } else {
        throw new Error('Batch transaction execution failed');
      }
    } catch (error) {
      console.error('❌ Investment batch failed:', error);
      return {
        success: false,
        message: `Investment batch failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 수익 분배 배치 트랜잭션 실행
   * @param distributionData - 분배 데이터
   * @returns 배치 실행 결과
   */
  async executeDistributionBatch(distributionData: {
    projectWallet: string;
    platformWallet: string;
    totalRevenue: number;
    platformShare: number;
    creatorShare: number;
    investorDistributions: Array<{
      investorAddress: string;
      amount: number;
    }>;
    signerWallet: Wallet;
  }): Promise<BatchResult> {
    try {
      const batchId = `dist_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. 분배 트랜잭션들 생성
      const innerTransactions = [
        // 플랫폼 수수료
        this.createInnerPayment({
          from: distributionData.projectWallet,
          to: distributionData.platformWallet,
          amount: this.xrpToDrops(distributionData.platformShare.toString()),
          description: 'Platform revenue share'
        }),
        // 창업자 수익
        this.createInnerPayment({
          from: distributionData.projectWallet,
          to: distributionData.projectWallet, // 창업자 지갑
          amount: this.xrpToDrops(distributionData.creatorShare.toString()),
          description: 'Creator revenue share'
        }),
        // 투자자별 분배
        ...distributionData.investorDistributions.map(investor => 
          this.createInnerPayment({
            from: distributionData.projectWallet,
            to: investor.investorAddress,
            amount: this.xrpToDrops(investor.amount.toString()),
            description: `Revenue distribution to investor ${investor.investorAddress}`
          })
        )
      ];

      // 2. 배치 트랜잭션 구성
      const batchTx = {
        TransactionType: TRANSACTION_TYPES.BATCH,
        Account: distributionData.projectWallet,
        RawTransactions: innerTransactions,
        Flags: this.getBatchFlags(BATCH_MODES.ALL_OR_NOTHING),
        Fee: '20' // 분배는 더 복잡하므로 높은 수수료
      };

      // 3. 배치 트랜잭션 제출
      const result = await this.submitBatchTransaction(batchTx, distributionData.signerWallet);

      if (result.success) {
        const batchResult: BatchResult = {
          success: true,
          hash: result.hash,
          result: result.result,
          batchId,
          innerTransactionCount: innerTransactions.length,
          totalAmount: distributionData.totalRevenue
        };

        this.batchHistory.set(batchId, batchResult);

        console.log(`✅ Distribution batch executed: ${batchId}`);
        console.log(`   - Total Revenue: ${distributionData.totalRevenue} XRP`);
        console.log(`   - Platform Share: ${distributionData.platformShare} XRP`);
        console.log(`   - Creator Share: ${distributionData.creatorShare} XRP`);
        console.log(`   - Investor Count: ${distributionData.investorDistributions.length}`);
        console.log(`   - Hash: ${result.hash}`);

        return batchResult;
      } else {
        throw new Error('Distribution batch execution failed');
      }
    } catch (error) {
      console.error('❌ Distribution batch failed:', error);
      return {
        success: false,
        message: `Distribution batch failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 토큰 전송 배치 트랜잭션 실행
   * @param tokenTransferData - 토큰 전송 데이터
   * @returns 배치 실행 결과
   */
  async executeTokenTransferBatch(tokenTransferData: {
    fromWallet: Wallet;
    transfers: Array<{
      toAddress: string;
      mptIssuanceId: string;
      amount: number;
    }>;
  }): Promise<BatchResult> {
    try {
      const batchId = `token_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. 토큰 전송 트랜잭션들 생성
      const innerTransactions = tokenTransferData.transfers.map(transfer =>
        this.createInnerTokenTransfer({
          from: tokenTransferData.fromWallet.address,
          to: transfer.toAddress,
          mptIssuanceId: transfer.mptIssuanceId,
          amount: transfer.amount,
          description: `Token transfer to ${transfer.toAddress}`
        })
      );

      // 2. 배치 트랜잭션 구성
      const batchTx = {
        TransactionType: TRANSACTION_TYPES.BATCH,
        Account: tokenTransferData.fromWallet.address,
        RawTransactions: innerTransactions,
        Flags: this.getBatchFlags(BATCH_MODES.ALL_OR_NOTHING),
        Fee: '10'
      };

      // 3. 배치 트랜잭션 제출
      const result = await this.submitBatchTransaction(batchTx, tokenTransferData.fromWallet);

      if (result.success) {
        const batchResult: BatchResult = {
          success: true,
          hash: result.hash,
          result: result.result,
          batchId,
          innerTransactionCount: innerTransactions.length,
          totalAmount: tokenTransferData.transfers.reduce((sum, t) => sum + t.amount, 0)
        };

        this.batchHistory.set(batchId, batchResult);

        console.log(`✅ Token transfer batch executed: ${batchId}`);
        console.log(`   - Transfer Count: ${tokenTransferData.transfers.length}`);
        console.log(`   - Hash: ${result.hash}`);

        return batchResult;
      } else {
        throw new Error('Token transfer batch execution failed');
      }
    } catch (error) {
      console.error('❌ Token transfer batch failed:', error);
      return {
        success: false,
        message: `Token transfer batch failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * 내부 Payment 트랜잭션 생성
   * @param paymentData - 결제 데이터
   * @returns RawTransaction
   */
  private createInnerPayment(paymentData: {
    from: string;
    to: string;
    amount: string;
    description: string;
  }): { RawTransaction: TransactionData } {
    return {
      RawTransaction: {
        TransactionType: TRANSACTION_TYPES.PAYMENT,
        Account: paymentData.from,
        Destination: paymentData.to,
        Amount: paymentData.amount,
        Flags: 'TfInnerBatchTxn', // 내부 배치 트랜잭션 플래그
        Memos: [{
          Memo: {
            MemoData: Buffer.from(paymentData.description, 'utf8').toString('hex').toUpperCase()
          }
        }]
      }
    };
  }

  /**
   * 내부 토큰 전송 트랜잭션 생성
   * @param transferData - 전송 데이터
   * @returns RawTransaction
   */
  private createInnerTokenTransfer(transferData: {
    from: string;
    to: string;
    mptIssuanceId: string;
    amount: number;
    description: string;
  }): { RawTransaction: TransactionData } {
    return {
      RawTransaction: {
        TransactionType: TRANSACTION_TYPES.PAYMENT,
        Account: transferData.from,
        Destination: transferData.to,
        Amount: {
          mpt_issuance_id: transferData.mptIssuanceId,
          value: transferData.amount.toString()
        },
        Flags: 'TfInnerBatchTxn',
        Memos: [{
          Memo: {
            MemoData: Buffer.from(transferData.description, 'utf8').toString('hex').toUpperCase()
          }
        }]
      }
    };
  }

  /**
   * 배치 플래그 생성
   * @param mode - 배치 모드
   * @returns 플래그 값
   */
  private getBatchFlags(mode: BatchMode): string {
    switch (mode) {
      case BATCH_MODES.ALL_OR_NOTHING:
        return 'TfAllOrNothing';
      case BATCH_MODES.INDEPENDENT:
        return 'TfIndependent';
      case BATCH_MODES.ONLY_ONE:
        return 'TfOnlyOne';
      case BATCH_MODES.UNTIL_FAILURE:
        return 'TfUntilFailure';
      default:
        return 'TfAllOrNothing';
    }
  }

  /**
   * 배치 트랜잭션 검증
   * @param batchTx - 배치 트랜잭션
   */
  private validateBatchTransaction(batchTx: any): void {
    if (!batchTx.Account || !batchTx.RawTransactions || !Array.isArray(batchTx.RawTransactions)) {
      throw new Error('Invalid batch transaction: missing required fields');
    }

    if (batchTx.RawTransactions.length === 0) {
      throw new Error('Invalid batch transaction: no inner transactions');
    }

    if (batchTx.RawTransactions.length > 10) {
      throw new Error('Invalid batch transaction: too many inner transactions (max 10)');
    }
  }

  /**
   * 배치 트랜잭션 제출
   * @param batchTx - 배치 트랜잭션
   * @param wallet - 서명할 지갑
   * @returns 제출 결과
   */
  private async submitBatchTransaction(batchTx: any, wallet: Wallet): Promise<any> {
    try {
      const signedTx = wallet.sign(batchTx);
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
          throw new Error(`Batch transaction failed: ${meta.TransactionResult}`);
        }
      } else {
        throw new Error('Invalid batch transaction result format');
      }
    } catch (error) {
      console.error('Batch transaction submission failed:', error);
      throw error;
    }
  }

  /**
   * 배치 결과 조회
   * @param batchId - 배치 ID
   * @returns 배치 결과
   */
  getBatchResult(batchId: string): BatchResult | undefined {
    return this.batchHistory.get(batchId);
  }

  /**
   * 모든 배치 결과 조회
   * @returns 배치 결과 목록
   */
  getAllBatchResults(): BatchResult[] {
    return Array.from(this.batchHistory.values());
  }

  /**
   * XRP를 드롭으로 변환
   * @param xrp - XRP 양
   * @returns 드롭 양
   */
  private xrpToDrops(xrp: string): string {
    return (parseFloat(xrp) * 1_000_000).toString();
  }
}
