import { Client, Wallet } from "xrpl";

/**
 * XRPL Payment Functions for GovernX
 * Handles XRP payments for project investments
 */

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
  senderBalance?: number;
  receiverBalance?: number;
}

/**
 * Send XRP payment
 * @param senderSeed Sender's seed (starts with 's')
 * @param receiverAddr Receiver's classic address (starts with 'r')
 * @param amountXRP Amount to send in XRP
 * @param network Network to use ('testnet' or 'mainnet')
 */
export async function sendXRPPayment(
  senderSeed: string, 
  receiverAddr: string, 
  amountXRP: number,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<PaymentResult> {
  // Network configuration
  const networkUrl = network === 'testnet' 
    ? "wss://s.devnet.rippletest.net:51233"
    : "wss://xrplcluster.com";
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    // Load sender wallet
    const senderWallet = Wallet.fromSeed(senderSeed);

    // Get balance helper function
    const getBalanceXRP = async (classicAddress: string): Promise<number> => {
      try {
        const accountInfo = await client.request({
          command: "account_info",
          account: classicAddress,
          ledger_index: "validated"
        });
        return parseFloat(accountInfo.result.account_data.Balance) / 1_000_000;
      } catch (error) {
        console.error(`Error getting balance for ${classicAddress}:`, error);
        return 0;
      }
    };

    // Check sender balance before payment
    const senderBalance = await getBalanceXRP(senderWallet.classicAddress);
    if (senderBalance < amountXRP) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${senderBalance} XRP, Required: ${amountXRP} XRP`
      };
    }

    // Convert XRP to drops (1 XRP = 1,000,000 drops)
    const amountDrops = (amountXRP * 1_000_000).toString();

    // Create payment transaction
    const paymentTx: any = {
      TransactionType: "Payment",
      Account: senderWallet.classicAddress,
      Destination: receiverAddr,
      Amount: amountDrops
    };

    // Auto-fill and sign transaction
    const prepared = await client.autofill(paymentTx);
    const signed = senderWallet.sign(prepared);

    // Submit and wait for consensus
    const result = await client.submitAndWait(signed.tx_blob);
    
    // Check if transaction was successful
    if ((result.result as any).engine_result !== 'tesSUCCESS') {
      return {
        success: false,
        error: `Transaction failed: ${(result.result as any).engine_result}`
      };
    }

    // Get final balances
    const finalSenderBalance = await getBalanceXRP(senderWallet.classicAddress);
    const finalReceiverBalance = await getBalanceXRP(receiverAddr);

    return {
      success: true,
      txHash: signed.hash,
      senderBalance: finalSenderBalance,
      receiverBalance: finalReceiverBalance
    };

  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  } finally {
    await client.disconnect();
  }
}

/**
 * Get account balance in XRP
 * @param address Classic address to check
 * @param network Network to use
 */
export async function getAccountBalance(
  address: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ balance: number; error?: string }> {
  const networkUrl = network === 'testnet' 
    ? "wss://s.devnet.rippletest.net:51233"
    : "wss://xrplcluster.com";
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    const accountInfo = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated"
    });

    const balance = parseFloat(accountInfo.result.account_data.Balance) / 1_000_000;
    
    return { balance };
  } catch (error) {
    console.error('Balance check error:', error);
    return { 
      balance: 0, 
      error: error instanceof Error ? error.message : 'Failed to get balance' 
    };
  } finally {
    await client.disconnect();
  }
}
