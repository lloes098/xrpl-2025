import { Client, Wallet } from "xrpl";

/**
 * XRPL Token Functions for GovernX
 * Handles IOU token creation and management
 */

export interface TokenCreationResult {
  success: boolean;
  trustTxHash?: string;
  paymentTxHash?: string;
  error?: string;
}

export interface TokenInfo {
  currency: string;
  issuer: string;
  value: string;
  limit?: string;
}

/**
 * Create and issue IOU tokens
 * @param currency Token currency code (e.g., "USD", "ETF")
 * @param issuerSeed Issuer wallet seed
 * @param holderSeed Holder wallet seed
 * @param amount Amount to issue
 * @param network Network to use
 */
export async function createIOUToken(
  currency: string,
  issuerSeed: string,
  holderSeed: string,
  amount: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TokenCreationResult> {
  const networkUrl = network === 'testnet' 
    ? "wss://s.altnet.rippletest.net:51233"  // 올바른 testnet URL
    : "wss://xrplcluster.com";               // mainnet URL
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    // Load wallets
    const issuerWallet = Wallet.fromSeed(issuerSeed);
    const holderWallet = Wallet.fromSeed(holderSeed);

    const issuer = issuerWallet.address;
    const holder = holderWallet.address;

    // Step 1: Create trust line (holder side)
    const trustSetTx = {
      TransactionType: "TrustSet",
      Account: holder,
      LimitAmount: {
        currency,
        issuer: issuer,
        value: "1000000", // High limit
      },
    } as const;

    const trustPrepared = await client.autofill(trustSetTx);
    const trustSigned = holderWallet.sign(trustPrepared);
    const trustResult = await client.submitAndWait(trustSigned.tx_blob);

    const trustOK = trustResult?.result?.meta && 
      typeof trustResult.result.meta === 'object' && 
      'TransactionResult' in trustResult.result.meta && 
      trustResult.result.meta.TransactionResult === "tesSUCCESS";

    if (!trustOK) {
      const errorMsg = trustResult?.result?.meta && 
        typeof trustResult.result.meta === 'object' && 
        'TransactionResult' in trustResult.result.meta ? 
        trustResult.result.meta.TransactionResult : "unknown";
      throw new Error("TrustSet failed: " + errorMsg);
    }

    // Step 2: Issue tokens (issuer side)
    const paymentTx = {
      TransactionType: "Payment",
      Account: issuer,
      Destination: holder,
      Amount: {
        currency,
        issuer,
        value: amount,
      },
    } as const;

    const payPrepared = await client.autofill(paymentTx);
    const paySigned = issuerWallet.sign(payPrepared);
    const payResult = await client.submitAndWait(paySigned.tx_blob);

    const payOK = payResult?.result?.meta && 
      typeof payResult.result.meta === 'object' && 
      'TransactionResult' in payResult.result.meta && 
      payResult.result.meta.TransactionResult === "tesSUCCESS";

    if (!payOK) {
      const errorMsg = payResult?.result?.meta && 
        typeof payResult.result.meta === 'object' && 
        'TransactionResult' in payResult.result.meta ? 
        payResult.result.meta.TransactionResult : "unknown";
      throw new Error("Payment (issue IOU) failed: " + errorMsg);
    }

    return {
      success: true,
      trustTxHash: trustResult?.result?.hash,
      paymentTxHash: payResult?.result?.hash,
    };

  } catch (error) {
    console.error('Token creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create token'
    };
  } finally {
    await client.disconnect();
  }
}


/**
 * Send IOU tokens
 * @param senderSeed Sender wallet seed
 * @param receiverAddr Receiver address
 * @param currency Token currency
 * @param issuer Token issuer
 * @param amount Amount to send
 * @param network Network to use
 */
export async function sendIOUToken(
  senderSeed: string,
  receiverAddr: string,
  currency: string,
  issuer: string,
  amount: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const networkUrl = network === 'testnet' 
    ? "wss://s.altnet.rippletest.net:51233"  // 올바른 testnet URL
    : "wss://xrplcluster.com";               // mainnet URL
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    const senderWallet = Wallet.fromSeed(senderSeed);

    const paymentTx = {
      TransactionType: "Payment",
      Account: senderWallet.address,
      Destination: receiverAddr,
      Amount: {
        currency,
        issuer,
        value: amount,
      },
    } as const;

    const prepared = await client.autofill(paymentTx);
    const signed = senderWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    const success = result?.result?.meta && 
      typeof result.result.meta === 'object' && 
      'TransactionResult' in result.result.meta && 
      result.result.meta.TransactionResult === "tesSUCCESS";

    if (!success) {
      const errorMsg = result?.result?.meta && 
        typeof result.result.meta === 'object' && 
        'TransactionResult' in result.result.meta ? 
        result.result.meta.TransactionResult : "unknown";
      throw new Error("Token payment failed: " + errorMsg);
    }

    return {
      success: true,
      txHash: result?.result?.hash,
    };

  } catch (error) {
    console.error('Token send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send token'
    };
  } finally {
    await client.disconnect();
  }
}
