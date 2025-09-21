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

    if (amountXRP <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0'
      };
    }


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
        
        // Account not found 에러인 경우 명확한 메시지 반환
        if (error instanceof Error && error.message.includes('Account not found')) {
          throw new Error(`Account not found on XRPL network. Please create a new wallet or use a valid address.`);
        }
        
        return 0;
      }
    };

    // Check sender balance before payment
    let senderBalance: number;
    try {
      senderBalance = await getBalanceXRP(senderWallet.classicAddress);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check balance'
      };
    }
    
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
    ? "wss://s.altnet.rippletest.net:51233"  // 올바른 testnet URL
    : "wss://xrplcluster.com";               // mainnet URL
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    // 주소 유효성 검사
    if (!address || !address.startsWith('r') || address.length < 25) {
      return { 
        balance: 0, 
        error: 'Invalid XRPL address format' 
      };
    }

    const accountInfo = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated"
    });

    const balance = parseFloat(accountInfo.result.account_data.Balance) / 1_000_000;
    
    return { balance };
  } catch (error) {
    console.error('Balance check error for address:', address, error);
    
    // Account not found 에러 처리
    if (error instanceof Error && error.message.includes('Account not found')) {
      return { 
        balance: 0, 
        error: 'Account not found on XRPL network. Please check if the address is correct or create a new wallet.' 
      };
    }
    
    // Account malformed 에러 처리
    if (error instanceof Error && error.message.includes('Account malformed')) {
      return { 
        balance: 0, 
        error: 'Invalid XRPL address format. Please check the address.' 
      };
    }
    
    return { 
      balance: 0, 
      error: error instanceof Error ? error.message : 'Failed to get balance' 
    };
  } finally {
    await client.disconnect();
  }
}
