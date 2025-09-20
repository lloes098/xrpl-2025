import { Client, Wallet } from "xrpl";

/**
 * Trustline Functions for GovernX
 * Handles trustline setup for IOU tokens
 */

export interface TrustlineResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Set up trustline for IOU token
 * @param holderSeed Holder's seed (starts with 's')
 * @param issuerAddress Token issuer address
 * @param currency Token currency code (e.g., 'USDC', 'USDT')
 * @param limitValue Trust limit (default: "1000000")
 * @param network Network to use ('testnet' or 'mainnet')
 */
export async function setupTrustline(
  holderSeed: string,
  issuerAddress: string,
  currency: string,
  limitValue: string = "1000000",
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TrustlineResult> {
  // Network configuration
  const networkUrl = network === 'testnet' 
    ? "wss://s.devnet.rippletest.net:51233"
    : "wss://xrplcluster.com";
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    // Load holder wallet
    const holderWallet = Wallet.fromSeed(holderSeed);

    // Validate inputs
    if (!issuerAddress || !issuerAddress.startsWith('r')) {
      return {
        success: false,
        error: 'Invalid issuer address. Must start with "r"'
      };
    }

    if (!currency) {
      return {
        success: false,
        error: 'Currency code is required'
      };
    }

    // Create trustline transaction
    const trustSetTx: any = {
      TransactionType: "TrustSet",
      Account: holderWallet.classicAddress,
      LimitAmount: {
        currency: currency,
        issuer: issuerAddress,
        value: limitValue,
      }
    };

    // Auto-fill and sign transaction
    const prepared = await client.autofill(trustSetTx);
    const signed = holderWallet.sign(prepared);

    // Submit and wait for consensus with timeout
    const result = await Promise.race([
      client.submitAndWait(signed.tx_blob),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout after 30 seconds')), 30000)
      )
    ]) as any;
    
    // Check if transaction was successful
    const engineResult = (result.result as any).engine_result;
    const meta = (result.result as any).meta;
    const transactionResult = meta?.TransactionResult;
    
    // Transaction is successful if engine_result is tesSUCCESS OR if meta.TransactionResult is tesSUCCESS
    const isSuccess = engineResult === 'tesSUCCESS' || transactionResult === 'tesSUCCESS';
    
    if (!isSuccess) {
      const errorMessage = engineResult || transactionResult || 'Unknown transaction error';
      
      return {
        success: false,
        error: `Trustline setup failed: ${errorMessage}`
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
    await client.disconnect();
  }
}

/**
 * Check if trustline exists for a token
 * @param address Address to check
 * @param currency Token currency code
 * @param issuerAddress Token issuer address
 * @param network Network to use
 */
export async function checkTrustline(
  address: string,
  currency: string,
  issuerAddress: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ exists: boolean; error?: string }> {
  const networkUrl = network === 'testnet' 
    ? "wss://s.devnet.rippletest.net:51233"
    : "wss://xrplcluster.com";
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    const accountLines = await client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated"
    });

    // Check if trustline exists for the specific token
    const trustlineExists = accountLines.result.lines.some((line: any) => 
      line.currency === currency && line.account === issuerAddress
    );

    return { exists: trustlineExists };
    
  } catch (error) {
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Failed to check trustline' 
    };
  } finally {
    await client.disconnect();
  }
}
