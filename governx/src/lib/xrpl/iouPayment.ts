import { Client, Wallet } from "xrpl";

/**
 * IOU Token Payment Functions for GovernX
 * Handles IOU token payments for project investments
 */

export interface IOUPaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
  senderBalance?: any;
  receiverBalance?: any;
}

/**
 * Send IOU token payment
 * @param senderSeed Sender's seed (starts with 's')
 * @param receiverAddr Receiver's classic address (starts with 'r')
 * @param tokenSymbol Token symbol (e.g., 'USDC', 'USDT')
 * @param tokenIssuer Token issuer address
 * @param amount Amount to send
 * @param network Network to use ('testnet' or 'mainnet')
 */
export async function sendIOUPayment(
  senderSeed: string,
  receiverAddr: string,
  tokenSymbol: string,
  tokenIssuer: string,
  amount: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<IOUPaymentResult> {
  // Network configuration
  const networkUrl = network === 'testnet' 
    ? "wss://s.altnet.rippletest.net:51233"  // 올바른 testnet URL
    : "wss://xrplcluster.com";               // mainnet URL
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    // Load sender wallet
    const senderWallet = Wallet.fromSeed(senderSeed);

    // Validate inputs
    if (!receiverAddr || !receiverAddr.startsWith('r')) {
      return {
        success: false,
        error: 'Invalid receiver address. Must start with "r"'
      };
    }

    if (!tokenSymbol || !tokenIssuer) {
      return {
        success: false,
        error: 'Token symbol and issuer are required'
      };
    }

    if (parseFloat(amount) <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0'
      };
    }

    // Create IOU payment transaction
    const iouPaymentTx: any = {
      TransactionType: "Payment",
      Account: senderWallet.classicAddress,
      Destination: receiverAddr,
      Amount: {
        currency: tokenSymbol,
        issuer: tokenIssuer,
        value: amount,
      }
    };

    // Auto-fill and sign transaction
    const prepared = await client.autofill(iouPaymentTx);
    const signed = senderWallet.sign(prepared);

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
        error: `Transaction failed: ${errorMessage}`
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
 * Get IOU token balance
 * @param address Classic address to check
 * @param tokenSymbol Token symbol
 * @param tokenIssuer Token issuer address
 * @param network Network to use
 */
export async function getIOUBalance(
  address: string,
  tokenSymbol: string,
  tokenIssuer: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ balance: string; error?: string }> {
  const networkUrl = network === 'testnet' 
    ? "wss://s.altnet.rippletest.net:51233"  // 올바른 testnet URL
    : "wss://xrplcluster.com";               // mainnet URL
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    const accountLines = await client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated"
    });

    // Find the specific token balance
    const tokenLine = accountLines.result.lines.find((line: any) => 
      line.currency === tokenSymbol && line.account === tokenIssuer
    );

    if (tokenLine) {
      return { balance: tokenLine.balance };
    } else {
      return { balance: "0" };
    }
    
  } catch (error) {
    return { 
      balance: "0", 
      error: error instanceof Error ? error.message : 'Failed to get balance' 
    };
  } finally {
    await client.disconnect();
  }
}
