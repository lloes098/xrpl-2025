import { Client, Wallet } from "xrpl";

/**
 * Escrow Completion Manager for GovernX
 * Handles various escrow completion scenarios
 */

export interface EscrowCompletionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface EscrowCompletionInfo {
  owner: string;
  sequence: number;
  destination: string;
  amount: any;
  finishAfter: number;
  cancelAfter: number;
  condition?: string;
  fulfillment?: string;
}

/**
 * Escrow Completion Manager Class
 */
export class EscrowCompletionManager {
  private client: Client;
  private network: 'testnet' | 'mainnet';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    const networkUrl = network === 'testnet' 
      ? "wss://s.devnet.rippletest.net:51233"
      : "wss://xrplcluster.com";
    this.client = new Client(networkUrl);
  }

  /**
   * Connect to XRPL network
   */
  async connect(): Promise<void> {
    try {
      if (!this.client.isConnected()) {
        await this.client.connect();
        console.log('Connected to XRPL network:', this.network);
      }
    } catch (error) {
      console.error('Failed to connect to XRPL network:', error);
      throw new Error(`Network connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from XRPL network
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Get current time in Ripple Epoch
   */
  private now(): number {
    return Math.floor(Date.now() / 1000) - 946_684_800;
  }

  /**
   * Finish escrow (release funds) - Auto finish after time
   * @param finisherSeed Finisher's seed
   * @param ownerAddress Escrow owner address
   * @param offerSequence Escrow sequence number
   * @param fulfillment Optional fulfillment for conditional escrow
   */
  async finishEscrow(
    finisherSeed: string,
    ownerAddress: string,
    offerSequence: number,
    fulfillment?: string
  ): Promise<EscrowCompletionResult> {
    try {
      await this.connect();

      const finisherWallet = Wallet.fromSeed(finisherSeed);

      const tx: any = {
        TransactionType: "EscrowFinish",
        Account: finisherWallet.classicAddress,
        Owner: ownerAddress,
        OfferSequence: offerSequence,
        ...(fulfillment && { Fulfillment: fulfillment })
      };

      const prepared = await this.client.autofill(tx);
      const signed = finisherWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const engineResult = (result.result as any).engine_result;
      const meta = (result.result as any).meta;
      const transactionResult = meta?.TransactionResult;
      
      const isSuccess = engineResult === 'tesSUCCESS' || transactionResult === 'tesSUCCESS';
      
      if (!isSuccess) {
        const errorMessage = engineResult || transactionResult || 'Unknown transaction error';
        return {
          success: false,
          error: `Escrow finish failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Cancel escrow (return funds to creator) - Auto cancel after time
   * @param cancelerSeed Canceler's seed
   * @param ownerAddress Escrow owner address
   * @param offerSequence Escrow sequence number
   */
  async cancelEscrow(
    cancelerSeed: string,
    ownerAddress: string,
    offerSequence: number
  ): Promise<EscrowCompletionResult> {
    try {
      await this.connect();

      const cancelerWallet = Wallet.fromSeed(cancelerSeed);

      const tx: any = {
        TransactionType: "EscrowCancel",
        Account: cancelerWallet.classicAddress,
        Owner: ownerAddress,
        OfferSequence: offerSequence
      };

      const prepared = await this.client.autofill(tx);
      const signed = cancelerWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const engineResult = (result.result as any).engine_result;
      const meta = (result.result as any).meta;
      const transactionResult = meta?.TransactionResult;
      
      const isSuccess = engineResult === 'tesSUCCESS' || transactionResult === 'tesSUCCESS';
      
      if (!isSuccess) {
        const errorMessage = engineResult || transactionResult || 'Unknown transaction error';
        return {
          success: false,
          error: `Escrow cancel failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Get escrow information
   * @param ownerAddress Escrow owner address
   * @param offerSequence Escrow sequence number
   */
  async getEscrowInfo(ownerAddress: string, offerSequence: number): Promise<EscrowCompletionInfo | null> {
    try {
      await this.connect();

      const response = await this.client.request({
        command: "account_objects",
        account: ownerAddress,
        type: "escrow",
        ledger_index: "validated"
      });

      const escrow = response.result.account_objects.find(
        (obj: any) => obj.Sequence === offerSequence
      );

      if (escrow) {
        return {
          owner: (escrow as any).Account,
          sequence: (escrow as any).Sequence,
          destination: (escrow as any).Destination,
          amount: (escrow as any).Amount,
          finishAfter: (escrow as any).FinishAfter,
          cancelAfter: (escrow as any).CancelAfter,
          condition: (escrow as any).Condition,
          fulfillment: (escrow as any).Fulfillment
        };
      }

      return null;

    } catch (error) {
      console.error('Failed to get escrow info:', error);
      return null;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Check if escrow can be finished (time-based)
   * @param escrowInfo Escrow information
   */
  canFinishEscrow(escrowInfo: EscrowCompletionInfo): boolean {
    const currentTime = this.now();
    return currentTime >= escrowInfo.finishAfter;
  }

  /**
   * Check if escrow can be cancelled (time-based)
   * @param escrowInfo Escrow information
   */
  canCancelEscrow(escrowInfo: EscrowCompletionInfo): boolean {
    const currentTime = this.now();
    return currentTime >= escrowInfo.cancelAfter;
  }

  /**
   * Auto-finish escrow when conditions are met
   * @param finisherSeed Finisher's seed
   * @param ownerAddress Escrow owner address
   * @param offerSequence Escrow sequence number
   */
  async autoFinishEscrow(
    finisherSeed: string,
    ownerAddress: string,
    offerSequence: number
  ): Promise<EscrowCompletionResult> {
    try {
      // First check if escrow can be finished
      const escrowInfo = await this.getEscrowInfo(ownerAddress, offerSequence);
      
      if (!escrowInfo) {
        return {
          success: false,
          error: 'Escrow not found'
        };
      }

      if (!this.canFinishEscrow(escrowInfo)) {
        return {
          success: false,
          error: `Escrow cannot be finished yet. Available after: ${new Date(escrowInfo.finishAfter * 1000).toLocaleString()}`
        };
      }

      // Proceed with finishing
      return await this.finishEscrow(finisherSeed, ownerAddress, offerSequence);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Auto-cancel escrow when conditions are met
   * @param cancelerSeed Canceler's seed
   * @param ownerAddress Escrow owner address
   * @param offerSequence Escrow sequence number
   */
  async autoCancelEscrow(
    cancelerSeed: string,
    ownerAddress: string,
    offerSequence: number
  ): Promise<EscrowCompletionResult> {
    try {
      // First check if escrow can be cancelled
      const escrowInfo = await this.getEscrowInfo(ownerAddress, offerSequence);
      
      if (!escrowInfo) {
        return {
          success: false,
          error: 'Escrow not found'
        };
      }

      if (!this.canCancelEscrow(escrowInfo)) {
        return {
          success: false,
          error: `Escrow cannot be cancelled yet. Available after: ${new Date(escrowInfo.cancelAfter * 1000).toLocaleString()}`
        };
      }

      // Proceed with cancelling
      return await this.cancelEscrow(cancelerSeed, ownerAddress, offerSequence);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Helper functions for easy use
export async function finishEscrow(
  finisherSeed: string,
  ownerAddress: string,
  offerSequence: number,
  fulfillment?: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowCompletionResult> {
  const completionManager = new EscrowCompletionManager(network);
  return await completionManager.finishEscrow(finisherSeed, ownerAddress, offerSequence, fulfillment);
}

export async function cancelEscrow(
  cancelerSeed: string,
  ownerAddress: string,
  offerSequence: number,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowCompletionResult> {
  const completionManager = new EscrowCompletionManager(network);
  return await completionManager.cancelEscrow(cancelerSeed, ownerAddress, offerSequence);
}

export async function autoFinishEscrow(
  finisherSeed: string,
  ownerAddress: string,
  offerSequence: number,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowCompletionResult> {
  const completionManager = new EscrowCompletionManager(network);
  return await completionManager.autoFinishEscrow(finisherSeed, ownerAddress, offerSequence);
}

export async function autoCancelEscrow(
  cancelerSeed: string,
  ownerAddress: string,
  offerSequence: number,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowCompletionResult> {
  const completionManager = new EscrowCompletionManager(network);
  return await completionManager.autoCancelEscrow(cancelerSeed, ownerAddress, offerSequence);
}
