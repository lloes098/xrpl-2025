import { Client, Wallet } from "xrpl";

/**
 * XRPL Wallet Functions for GovernX
 * Handles wallet creation and management
 */

export interface WalletInfo {
  address: string;
  secret: string;
  balance: string;
  sequence: number;
}

export interface CreateWalletResult {
  success: boolean;
  wallet?: WalletInfo;
  error?: string;
}

/**
 * Create a new XRPL wallet with testnet funding
 * @param network Network to use ('testnet' or 'mainnet')
 */
export async function createXRPLWallet(
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<CreateWalletResult> {
  // Network configuration
  const networkUrl = network === 'testnet' 
    ? "wss://s.devnet.rippletest.net:51233"
    : "wss://xrplcluster.com";
    
  const client = new Client(networkUrl);
  
  try {
    await client.connect();

    if (network === 'testnet') {
      // For testnet, use faucet to fund the wallet
      const fundResult = await client.fundWallet();
      const testWallet: Wallet = fundResult.wallet;

      // Get account info
      const response = await client.request({
        command: "account_info",
        account: testWallet.classicAddress,
        ledger_index: "validated",
        strict: true,
      });

      const accountData = response.result.account_data;
      
      return {
        success: true,
        wallet: {
          address: testWallet.classicAddress,
          secret: testWallet.seed,
          balance: accountData.Balance,
          sequence: accountData.Sequence,
        }
      };
    } else {
      // For mainnet, just create wallet without funding
      const wallet = Wallet.generate();
      
      return {
        success: true,
        wallet: {
          address: wallet.classicAddress,
          secret: wallet.seed,
          balance: "0",
          sequence: 0,
        }
      };
    }
  } catch (error) {
    console.error('Wallet creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create wallet'
    };
  } finally {
    await client.disconnect();
  }
}

/**
 * Create wallet from existing seed
 * @param seed Existing wallet seed
 * @param network Network to use
 */
export function createWalletFromSeed(
  seed: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): { success: boolean; wallet?: Wallet; error?: string } {
  try {
    const wallet = Wallet.fromSeed(seed);
    return {
      success: true,
      wallet
    };
  } catch (error) {
    console.error('Invalid seed:', error);
    return {
      success: false,
      error: 'Invalid wallet seed'
    };
  }
}

/**
 * Validate wallet address format
 * @param address Address to validate
 */
export function isValidAddress(address: string): boolean {
  try {
    // Basic XRPL address validation
    return address.startsWith('r') && address.length === 34;
  } catch {
    return false;
  }
}

/**
 * Validate wallet seed format
 * @param seed Seed to validate
 */
export function isValidSeed(seed: string): boolean {
  try {
    // Basic XRPL seed validation
    return seed.startsWith('s') && seed.length >= 29;
  } catch {
    return false;
  }
}
