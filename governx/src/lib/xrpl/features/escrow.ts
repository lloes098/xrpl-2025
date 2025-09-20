import { Client, Wallet } from "xrpl";

/**
 * Escrow Manager for GovernX
 * Handles project funding escrow functionality
 */

export interface EscrowResult {
  success: boolean;
  txHash?: string;
  sequence?: number;
  error?: string;
}

export interface EscrowInfo {
  owner: string;
  sequence: number;
  destination: string;
  amount: any;
  finishAfter: number;
  cancelAfter: number;
  condition?: string;
}

/**
 * Escrow Manager Class
 */
export class EscrowManager {
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
    await this.client.connect();
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
   * Create XRP escrow for project funding
   * @param creatorSeed Project creator's seed
   * @param destination Destination address (project creator)
   * @param amount Amount in XRP
   * @param finishAfterDays Days until funds can be released
   * @param cancelAfterDays Days until funds can be cancelled
   * @param condition Optional condition for release
   */
  async createXRPEscrow(
    creatorSeed: string,
    destination: string,
    amount: number,
    finishAfterDays: number = 30,
    cancelAfterDays: number = 60,
    condition?: string
  ): Promise<EscrowResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);
      
      // Check account balance first
      const accountInfo = await this.client.request({
        command: "account_info",
        account: creatorWallet.classicAddress
      });

      const balance = parseFloat(accountInfo.result.account_data.Balance) / 1_000_000; // Convert drops to XRP
      
      if (balance < amount) {
        return {
          success: false,
          error: `Insufficient balance. Required: ${amount} XRP, Available: ${balance.toFixed(2)} XRP`
        };
      }

      const amountDrops = (amount * 1_000_000).toString();

      const tx: any = {
        TransactionType: "EscrowCreate",
        Account: creatorWallet.classicAddress,
        Destination: destination,
        Amount: amountDrops,
        FinishAfter: this.now() + (finishAfterDays * 24 * 60 * 60),
        CancelAfter: this.now() + (cancelAfterDays * 24 * 60 * 60),
        ...(condition && { Condition: condition })
      };

      const prepared = await this.client.autofill(tx);
      const signed = creatorWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const engineResult = (result.result as any).engine_result;
      const meta = (result.result as any).meta;
      const transactionResult = meta?.TransactionResult;
      
      const isSuccess = engineResult === 'tesSUCCESS' || transactionResult === 'tesSUCCESS';
      
      if (!isSuccess) {
        const errorMessage = engineResult || transactionResult || 'Unknown transaction error';
        return {
          success: false,
          error: `Escrow creation failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash,
        sequence: prepared.Sequence
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
   * Create IOU token escrow for project funding
   * @param creatorSeed Project creator's seed
   * @param destination Destination address
   * @param currency Token currency code
   * @param issuer Token issuer address
   * @param amount Amount to escrow
   * @param finishAfterDays Days until funds can be released
   * @param cancelAfterDays Days until funds can be cancelled
   * @param condition Optional condition for release
   */
  async createIOUEscrow(
    creatorSeed: string,
    destination: string,
    currency: string,
    issuer: string,
    amount: string,
    finishAfterDays: number = 30,
    cancelAfterDays: number = 60,
    condition?: string
  ): Promise<EscrowResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);

      // Check account balance for IOU token
      const accountLines = await this.client.request({
        command: "account_lines",
        account: creatorWallet.classicAddress,
        ledger_index: "validated"
      });

      const tokenBalance = accountLines.result.lines.find(
        (line: any) => line.currency === currency && line.account === issuer
      );

      if (!tokenBalance || parseFloat(tokenBalance.balance) < parseFloat(amount)) {
        return {
          success: false,
          error: `Insufficient ${currency} balance. Required: ${amount}, Available: ${tokenBalance?.balance || '0'}`
        };
      }

      const tx: any = {
        TransactionType: "EscrowCreate",
        Account: creatorWallet.classicAddress,
        Destination: destination,
        Amount: {
          currency: currency,
          issuer: issuer,
          value: amount
        },
        FinishAfter: this.now() + (finishAfterDays * 24 * 60 * 60),
        CancelAfter: this.now() + (cancelAfterDays * 24 * 60 * 60),
        ...(condition && { Condition: condition })
      };

      const prepared = await this.client.autofill(tx);
      const signed = creatorWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const engineResult = (result.result as any).engine_result;
      const meta = (result.result as any).meta;
      const transactionResult = meta?.TransactionResult;
      
      const isSuccess = engineResult === 'tesSUCCESS' || transactionResult === 'tesSUCCESS';
      
      if (!isSuccess) {
        const errorMessage = engineResult || transactionResult || 'Unknown transaction error';
        return {
          success: false,
          error: `IOU Escrow creation failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash,
        sequence: prepared.Sequence
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
   * Finish escrow (release funds)
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
  ): Promise<EscrowResult> {
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
   * Cancel escrow (return funds to creator)
   * @param cancelerSeed Canceler's seed
   * @param ownerAddress Escrow owner address
   * @param offerSequence Escrow sequence number
   */
  async cancelEscrow(
    cancelerSeed: string,
    ownerAddress: string,
    offerSequence: number
  ): Promise<EscrowResult> {
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
  async getEscrowInfo(ownerAddress: string, offerSequence: number): Promise<EscrowInfo | null> {
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
          owner: escrow.Account,
          sequence: escrow.Sequence,
          destination: escrow.Destination,
          amount: escrow.Amount,
          finishAfter: escrow.FinishAfter,
          cancelAfter: escrow.CancelAfter,
          condition: escrow.Condition
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
}

// Helper functions for easy use
export async function createProjectEscrow(
  creatorSeed: string,
  destination: string,
  amount: number,
  currency: string = "XRP",
  tokenIssuer?: string,
  finishAfterDays: number = 30,
  cancelAfterDays: number = 60,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowResult> {
  const escrowManager = new EscrowManager(network);
  
  if (currency === "XRP" || currency === "RLUSD") {
    return await escrowManager.createXRPEscrow(
      creatorSeed,
      destination,
      amount,
      finishAfterDays,
      cancelAfterDays
    );
  } else if (tokenIssuer) {
    return await escrowManager.createIOUEscrow(
      creatorSeed,
      destination,
      currency,
      tokenIssuer,
      amount.toString(),
      finishAfterDays,
      cancelAfterDays
    );
  } else {
    return {
      success: false,
      error: 'Token issuer required for IOU tokens'
    };
  }
}

export async function releaseProjectFunds(
  finisherSeed: string,
  ownerAddress: string,
  offerSequence: number,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowResult> {
  const escrowManager = new EscrowManager(network);
  return await escrowManager.finishEscrow(finisherSeed, ownerAddress, offerSequence);
}

export async function refundProjectFunds(
  cancelerSeed: string,
  ownerAddress: string,
  offerSequence: number,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EscrowResult> {
  const escrowManager = new EscrowManager(network);
  return await escrowManager.cancelEscrow(cancelerSeed, ownerAddress, offerSequence);
}
