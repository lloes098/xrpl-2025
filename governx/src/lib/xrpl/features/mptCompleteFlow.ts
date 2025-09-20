import { Client, Wallet } from "xrpl";

/**
 * MPT Complete Lifecycle Manager for GovernX
 * Handles the complete lifecycle of Multi-Purpose Tokens
 */

export interface MPTLifecycleResult {
  success: boolean;
  txHash?: string;
  error?: string;
  data?: any;
}

export interface MPTLifecycleInfo {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  issuanceId: string;
  distribution: {
    investors: number;
    team: number;
    community: number;
    reserves: number;
  };
  benefits: {
    votingRights: boolean;
    profitSharing: boolean;
    specialBenefits: boolean;
    governance: boolean;
  };
  status: 'created' | 'distributed' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
}

/**
 * MPT Complete Lifecycle Manager Class
 */
export class MPTLifecycleManager {
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
   * Create MPT with complete lifecycle setup
   * @param creatorSeed Creator's seed
   * @param tokenInfo Token information
   * @param distribution Distribution plan
   * @param benefits Token benefits
   */
  async createMPTWithLifecycle(
    creatorSeed: string,
    tokenInfo: {
      name: string;
      symbol: string;
      totalSupply: number;
      description: string;
    },
    distribution: {
      investors: number;
      team: number;
      community: number;
      reserves: number;
    },
    benefits: {
      votingRights: boolean;
      profitSharing: boolean;
      specialBenefits: boolean;
      governance: boolean;
    }
  ): Promise<MPTLifecycleResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);
      const issuanceId = `MPT_${tokenInfo.symbol}_${Date.now()}`;

      // Step 1: Create MPT issuance
      const createTx: any = {
        TransactionType: "NFTokenMint",
        Account: creatorWallet.classicAddress,
        NFTokenTaxon: 0,
        URI: Buffer.from(JSON.stringify({
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          description: tokenInfo.description,
          totalSupply: tokenInfo.totalSupply,
          issuanceId: issuanceId,
          distribution: distribution,
          benefits: benefits,
          status: 'created',
          createdAt: Date.now()
        })).toString('base64')
      };

      const prepared = await this.client.autofill(createTx);
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
          error: `MPT creation failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash,
        data: {
          issuanceId,
          tokenInfo,
          distribution,
          benefits,
          status: 'created',
          createdAt: Date.now()
        }
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
   * Distribute MPT tokens to stakeholders
   * @param creatorSeed Creator's seed
   * @param issuanceId MPT issuance ID
   * @param recipients Distribution recipients
   */
  async distributeMPTTokens(
    creatorSeed: string,
    issuanceId: string,
    recipients: Array<{
      address: string;
      amount: number;
      role: 'investor' | 'team' | 'community' | 'reserve';
    }>
  ): Promise<MPTLifecycleResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);
      const results = [];

      for (const recipient of recipients) {
        // Create NFToken for each recipient
        const distributeTx: any = {
          TransactionType: "NFTokenMint",
          Account: creatorWallet.classicAddress,
          NFTokenTaxon: 0,
          URI: Buffer.from(JSON.stringify({
            issuanceId: issuanceId,
            recipient: recipient.address,
            amount: recipient.amount,
            role: recipient.role,
            distributedAt: Date.now()
          })).toString('base64')
        };

        const prepared = await this.client.autofill(distributeTx);
        const signed = creatorWallet.sign(prepared);
        const result = await this.client.submitAndWait(signed.tx_blob);

        const engineResult = (result.result as any).engine_result;
        const meta = (result.result as any).meta;
        const transactionResult = meta?.TransactionResult;
        
        const isSuccess = engineResult === 'tesSUCCESS' || transactionResult === 'tesSUCCESS';
        
        if (!isSuccess) {
          const errorMessage = engineResult || transactionResult || 'Unknown transaction error';
          results.push({
            recipient: recipient.address,
            success: false,
            error: errorMessage
          });
        } else {
          results.push({
            recipient: recipient.address,
            success: true,
            txHash: signed.hash
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      return {
        success: successCount === totalCount,
        data: {
          results,
          successCount,
          totalCount,
          issuanceId
        },
        error: successCount < totalCount ? `${totalCount - successCount} distributions failed` : undefined
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
   * Activate MPT for trading and governance
   * @param creatorSeed Creator's seed
   * @param issuanceId MPT issuance ID
   */
  async activateMPT(
    creatorSeed: string,
    issuanceId: string
  ): Promise<MPTLifecycleResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);

      // Update MPT status to active
      const activateTx: any = {
        TransactionType: "NFTokenMint",
        Account: creatorWallet.classicAddress,
        NFTokenTaxon: 0,
        URI: Buffer.from(JSON.stringify({
          issuanceId: issuanceId,
          status: 'active',
          activatedAt: Date.now(),
          action: 'activation'
        })).toString('base64')
      };

      const prepared = await this.client.autofill(activateTx);
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
          error: `MPT activation failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash,
        data: {
          issuanceId,
          status: 'active',
          activatedAt: Date.now()
        }
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
   * Complete MPT lifecycle (project completion)
   * @param creatorSeed Creator's seed
   * @param issuanceId MPT issuance ID
   * @param completionData Project completion data
   */
  async completeMPTLifecycle(
    creatorSeed: string,
    issuanceId: string,
    completionData: {
      finalDistribution?: any;
      profitSharing?: any;
      governanceResults?: any;
      specialBenefits?: any;
    }
  ): Promise<MPTLifecycleResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);

      // Mark MPT as completed
      const completeTx: any = {
        TransactionType: "NFTokenMint",
        Account: creatorWallet.classicAddress,
        NFTokenTaxon: 0,
        URI: Buffer.from(JSON.stringify({
          issuanceId: issuanceId,
          status: 'completed',
          completedAt: Date.now(),
          completionData: completionData,
          action: 'completion'
        })).toString('base64')
      };

      const prepared = await this.client.autofill(completeTx);
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
          error: `MPT completion failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash,
        data: {
          issuanceId,
          status: 'completed',
          completedAt: Date.now(),
          completionData
        }
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
   * Cancel MPT lifecycle (project cancellation)
   * @param creatorSeed Creator's seed
   * @param issuanceId MPT issuance ID
   * @param reason Cancellation reason
   */
  async cancelMPTLifecycle(
    creatorSeed: string,
    issuanceId: string,
    reason: string
  ): Promise<MPTLifecycleResult> {
    try {
      await this.connect();

      const creatorWallet = Wallet.fromSeed(creatorSeed);

      // Mark MPT as cancelled
      const cancelTx: any = {
        TransactionType: "NFTokenMint",
        Account: creatorWallet.classicAddress,
        NFTokenTaxon: 0,
        URI: Buffer.from(JSON.stringify({
          issuanceId: issuanceId,
          status: 'cancelled',
          cancelledAt: Date.now(),
          reason: reason,
          action: 'cancellation'
        })).toString('base64')
      };

      const prepared = await this.client.autofill(cancelTx);
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
          error: `MPT cancellation failed: ${errorMessage}`
        };
      }

      return {
        success: true,
        txHash: signed.hash,
        data: {
          issuanceId,
          status: 'cancelled',
          cancelledAt: Date.now(),
          reason
        }
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
   * Get MPT lifecycle status
   * @param issuanceId MPT issuance ID
   */
  async getMPTLifecycleStatus(issuanceId: string): Promise<MPTLifecycleInfo | null> {
    try {
      await this.connect();

      // This would typically query the blockchain for MPT status
      // For now, return a mock status based on issuanceId
      return {
        tokenName: 'Project Token',
        tokenSymbol: 'PRJ',
        totalSupply: 1000000,
        issuanceId: issuanceId,
        distribution: {
          investors: 60,
          team: 20,
          community: 15,
          reserves: 5
        },
        benefits: {
          votingRights: true,
          profitSharing: true,
          specialBenefits: true,
          governance: true
        },
        status: 'active',
        createdAt: Date.now() - 86400000 // 1 day ago
      };

    } catch (error) {
      console.error('Failed to get MPT lifecycle status:', error);
      return null;
    } finally {
      await this.disconnect();
    }
  }
}

// Helper functions for easy use
export async function createMPTWithLifecycle(
  creatorSeed: string,
  tokenInfo: any,
  distribution: any,
  benefits: any,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<MPTLifecycleResult> {
  const lifecycleManager = new MPTLifecycleManager(network);
  return await lifecycleManager.createMPTWithLifecycle(creatorSeed, tokenInfo, distribution, benefits);
}

export async function distributeMPTTokens(
  creatorSeed: string,
  issuanceId: string,
  recipients: any[],
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<MPTLifecycleResult> {
  const lifecycleManager = new MPTLifecycleManager(network);
  return await lifecycleManager.distributeMPTTokens(creatorSeed, issuanceId, recipients);
}

export async function activateMPT(
  creatorSeed: string,
  issuanceId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<MPTLifecycleResult> {
  const lifecycleManager = new MPTLifecycleManager(network);
  return await lifecycleManager.activateMPT(creatorSeed, issuanceId);
}

export async function completeMPTLifecycle(
  creatorSeed: string,
  issuanceId: string,
  completionData: any,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<MPTLifecycleResult> {
  const lifecycleManager = new MPTLifecycleManager(network);
  return await lifecycleManager.completeMPTLifecycle(creatorSeed, issuanceId, completionData);
}

export async function cancelMPTLifecycle(
  creatorSeed: string,
  issuanceId: string,
  reason: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<MPTLifecycleResult> {
  const lifecycleManager = new MPTLifecycleManager(network);
  return await lifecycleManager.cancelMPTLifecycle(creatorSeed, issuanceId, reason);
}
