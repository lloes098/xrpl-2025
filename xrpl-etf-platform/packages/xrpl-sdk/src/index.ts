import { Client, Wallet, xrpToDrops, dropsToXrp } from 'xrpl';
import type { XRPLAccount, XRPLTransaction } from '@xrpl-etf/types';

export class XRPLClient {
  private client: Client;
  private isConnected: boolean = false;

  constructor(serverUrl: string = 'wss://s.altnet.rippletest.net:51233') {
    this.client = new Client(serverUrl);
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async createWallet(): Promise<XRPLAccount> {
    const wallet = Wallet.generate();
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    };
  }

  async getBalance(address: string): Promise<string> {
    await this.connect();
    const response = await this.client.getXrpBalance(address);
    return response;
  }

  async sendXRP(
    senderWallet: Wallet,
    destinationAddress: string,
    amount: string
  ): Promise<XRPLTransaction> {
    await this.connect();

    const payment = {
      TransactionType: 'Payment' as const,
      Account: senderWallet.address,
      Amount: xrpToDrops(amount),
      Destination: destinationAddress,
    };

    const response = await this.client.submitAndWait(payment, {
      wallet: senderWallet,
    });

    return {
      hash: response.result.hash,
      account: senderWallet.address,
      destination: destinationAddress,
      amount: amount,
      fee: '0', // Fee는 response에서 직접 접근하기 어려우므로 일단 0으로 설정
      sequence: 0, // Sequence도 마찬가지
      timestamp: new Date().toISOString(),
    };
  }

  async getAccountInfo(address: string) {
    await this.connect();
    return await this.client.request({
      command: 'account_info',
      account: address,
    });
  }

  async getTransactionHistory(address: string, limit: number = 10) {
    await this.connect();
    return await this.client.request({
      command: 'account_tx',
      account: address,
      limit,
    });
  }
}

// 유틸리티 함수들
export const utils = {
  xrpToDrops,
  dropsToXrp,
  isValidAddress: (address: string): boolean => {
    try {
      // XRPL 주소 검증 로직
      return address.length >= 25 && address.length <= 34 && address.startsWith('r');
    } catch {
      return false;
    }
  },
};

export { Wallet } from 'xrpl';
