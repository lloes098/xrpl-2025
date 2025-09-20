import { Client } from "xrpl";

/**
 * Balance Manager for GovernX
 * Handles XRP and IOU token balance queries
 */

export interface BalanceInfo {
  xrp: number;
  drops: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  currency: string;
  issuer: string;
  balance: string;
  limit: string;
  limit_peer: string;
  quality_in: number;
  quality_out: number;
}

export interface XRPBalance {
  drops: string;
  xrp: number;
}

/**
 * Balance Manager Class
 */
export class BalanceManager {
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
   * Get XRP balance for an account
   * @param address Account address
   */
  async getXRPBalance(address: string): Promise<XRPBalance> {
    try {
      await this.connect();

      const response = await this.client.request({
        command: "account_info",
        account: address,
        ledger_index: "validated",
        strict: true,
      });

      const balanceDrops = response.result.account_data.Balance;
      const balanceXRP = Number(balanceDrops) / 1_000_000;

      return {
        drops: balanceDrops,
        xrp: balanceXRP,
      };
    } catch (error) {
      throw new Error(`Failed to get XRP balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Get IOU token balances for an account
   * @param address Account address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      await this.connect();

      const response = await this.client.request({
        command: "account_lines",
        account: address,
        ledger_index: "validated",
      });

      return response.result.lines.map((line: any) => ({
        currency: line.currency,
        issuer: line.account,
        balance: line.balance,
        limit: line.limit,
        limit_peer: line.limit_peer,
        quality_in: line.quality_in || 0,
        quality_out: line.quality_out || 0,
      }));
    } catch (error) {
      throw new Error(`Failed to get token balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Get specific token balance
   * @param address Account address
   * @param currency Token currency code
   * @param issuer Token issuer address
   */
  async getSpecificTokenBalance(
    address: string, 
    currency: string, 
    issuer: string
  ): Promise<TokenBalance | null> {
    try {
      const tokenBalances = await this.getTokenBalances(address);
      
      return tokenBalances.find(
        token => token.currency === currency && token.issuer === issuer
      ) || null;
    } catch (error) {
      throw new Error(`Failed to get specific token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get complete balance information (XRP + tokens)
   * @param address Account address
   */
  async getCompleteBalance(address: string): Promise<BalanceInfo> {
    try {
      const [xrpBalance, tokenBalances] = await Promise.all([
        this.getXRPBalance(address),
        this.getTokenBalances(address)
      ]);

      return {
        xrp: xrpBalance.xrp,
        drops: xrpBalance.drops,
        tokens: tokenBalances
      };
    } catch (error) {
      throw new Error(`Failed to get complete balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get balance for a specific currency (XRP or IOU token)
   * @param address Account address
   * @param currency Currency code (XRP, USDC, USDT, etc.)
   * @param issuer Token issuer (only for IOU tokens)
   */
  async getCurrencyBalance(
    address: string, 
    currency: string, 
    issuer?: string
  ): Promise<{ balance: number; currency: string; issuer?: string }> {
    try {
      if (currency === 'XRP' || currency === 'RLUSD') {
        const xrpBalance = await this.getXRPBalance(address);
        return {
          balance: xrpBalance.xrp,
          currency: currency,
        };
      } else if (issuer) {
        const tokenBalance = await this.getSpecificTokenBalance(address, currency, issuer);
        return {
          balance: tokenBalance ? parseFloat(tokenBalance.balance) : 0,
          currency: currency,
          issuer: issuer,
        };
      } else {
        throw new Error('Issuer required for IOU tokens');
      }
    } catch (error) {
      throw new Error(`Failed to get currency balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper functions for easy use
export async function getXRPBalance(
  address: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<XRPBalance> {
  const balanceManager = new BalanceManager(network);
  return await balanceManager.getXRPBalance(address);
}

export async function getTokenBalances(
  address: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TokenBalance[]> {
  const balanceManager = new BalanceManager(network);
  return await balanceManager.getTokenBalances(address);
}

export async function getCompleteBalance(
  address: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<BalanceInfo> {
  const balanceManager = new BalanceManager(network);
  return await balanceManager.getCompleteBalance(address);
}

export async function getCurrencyBalance(
  address: string,
  currency: string,
  issuer?: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ balance: number; currency: string; issuer?: string }> {
  const balanceManager = new BalanceManager(network);
  return await balanceManager.getCurrencyBalance(address, currency, issuer);
}
