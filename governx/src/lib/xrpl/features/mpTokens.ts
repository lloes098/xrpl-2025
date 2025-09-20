import { Client, Wallet } from "xrpl";

/**
 * MPTokens (Multi-Purpose Token) Manager for GovernX
 * XRPL's new fundable token type providing simpler issuance and holding model
 */
export class MPTokenManager {
  private client: Client;
  private adminWallet: Wallet;
  private userWallet?: Wallet;
  private network: 'testnet' | 'mainnet';

  constructor(
    adminSeed: string, 
    userSeed?: string, 
    network: 'testnet' | 'mainnet' = 'testnet'
  ) {
    this.network = network;
    const networkUrl = network === 'testnet' 
      ? "wss://s.devnet.rippletest.net:51233"
      : "wss://xrplcluster.com";
      
    this.client = new Client(networkUrl);
    this.adminWallet = Wallet.fromSeed(adminSeed);
    if (userSeed) {
      this.userWallet = Wallet.fromSeed(userSeed);
    }
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
   * Get user wallet address
   */
  getUserAddress(): string | undefined {
    return this.userWallet?.address;
  }

  /**
   * Create MPT issuance definition
   * @param assetScale Decimal places (default: 0)
   * @param maximumAmount Maximum issuance amount (default: "1000000000")
   * @param flags Issuance policy flags
   * @param metadata Metadata (hex string, optional)
   * @returns Issuance result and IssuanceID
   */
  async createIssuance(
    assetScale: number = 0,
    maximumAmount: string = "1000000000",
    flags: {
      tfMPTCanTransfer?: boolean;
      tfMPTCanEscrow?: boolean;
      tfMPTRequireAuth?: boolean;
    } = {
      tfMPTCanTransfer: true,
      tfMPTCanEscrow: true,
      tfMPTRequireAuth: false
    },
    metadata?: string
  ): Promise<{ success: boolean; result?: any; issuanceId?: string; error?: string }> {
    const tx: any = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: this.adminWallet.address,
      AssetScale: assetScale,
      MaximumAmount: maximumAmount,
      Flags: flags,
      ...(metadata && { MPTokenMetadata: metadata })
    };

    try {
      const prepared = await this.client.autofill(tx);
      const signed = this.adminWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      // Extract IssuanceID
      const issuanceId = (result.result.meta as any)?.mpt_issuance_id;
      if (issuanceId) {
        return { success: true, result, issuanceId };
      } else {
        return { success: false, error: "IssuanceID not found" };
      }
    } catch (error) {
      console.error("Issuance creation failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create issuance' 
      };
    }
  }

  /**
   * Authorize holder (required when RequireAuth is true)
   * @param issuanceId Issuance ID
   * @param holderAddress Holder address (default: userWallet address)
   * @param isUnauthorize Whether to unauthorize (default: false)
   */
  async authorizeHolder(
    issuanceId: string,
    holderAddress?: string,
    isUnauthorize: boolean = false
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.userWallet && !holderAddress) {
      return { success: false, error: "Holder address is required" };
    }

    const tx: any = {
      TransactionType: "MPTokenAuthorize",
      Account: this.adminWallet.address,
      MPTokenIssuanceID: issuanceId,
      Holder: holderAddress || this.userWallet!.address,
      ...(isUnauthorize && { Flags: { tfMPTUnauthorize: true } })
    };

    try {
      const prepared = await this.client.autofill(tx);
      const signed = this.adminWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      return { success: true, result };
    } catch (error) {
      console.error("Authorization failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to authorize holder' 
      };
    }
  }

  /**
   * User opt-in (request permission)
   * @param issuanceId Issuance ID
   */
  async optIn(issuanceId: string): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.userWallet) {
      return { success: false, error: "User wallet is required" };
    }

    const tx: any = {
      TransactionType: "MPTokenAuthorize",
      Account: this.userWallet.address,
      MPTokenIssuanceID: issuanceId
    };

    try {
      const prepared = await this.client.autofill(tx);
      const signed = this.userWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      return { success: true, result };
    } catch (error) {
      console.error("Opt-in failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to opt-in' 
      };
    }
  }

  /**
   * Send MPT
   * @param issuanceId Issuance ID
   * @param destinationAddress Recipient address
   * @param amount Amount to send
   * @param fromAdmin Whether admin is sending (default: true)
   */
  async sendMPT(
    issuanceId: string,
    destinationAddress: string,
    amount: string,
    fromAdmin: boolean = true
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const senderWallet = fromAdmin ? this.adminWallet : this.userWallet;
    if (!senderWallet) {
      return { success: false, error: "Sender wallet is required" };
    }

    const tx: any = {
      TransactionType: "Payment",
      Account: senderWallet.address,
      Destination: destinationAddress,
      Amount: {
        mpt_issuance_id: issuanceId,
        value: amount
      }
    };

    try {
      const prepared = await this.client.autofill(tx);
      const signed = senderWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      return { success: true, result };
    } catch (error) {
      console.error("MPT send failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send MPT' 
      };
    }
  }

  /**
   * Destroy issuance (only when all holder balances are 0)
   * @param issuanceId Issuance ID
   */
  async destroyIssuance(issuanceId: string): Promise<{ success: boolean; result?: any; error?: string }> {
    const tx: any = {
      TransactionType: "MPTokenIssuanceDestroy",
      Account: this.adminWallet.address,
      MPTokenIssuanceID: issuanceId
    };

    try {
      const prepared = await this.client.autofill(tx);
      const signed = this.adminWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      return { success: true, result };
    } catch (error) {
      console.error("Issuance destruction failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to destroy issuance' 
      };
    }
  }
}

// Helper functions for individual operations
export async function createMPToken(
  adminSeed: string,
  userSeed: string,
  assetScale: number = 0,
  maximumAmount: string = "1000000000",
  metadata?: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ success: boolean; result?: any; issuanceId?: string; error?: string }> {
  const mptManager = new MPTokenManager(adminSeed, userSeed, network);
  
  try {
    await mptManager.connect();
    
    const flags = {
      tfMPTCanTransfer: true,
      tfMPTCanEscrow: true,
      tfMPTRequireAuth: false
    };
    
    return await mptManager.createIssuance(assetScale, maximumAmount, flags, metadata);
  } finally {
    await mptManager.disconnect();
  }
}

export async function optInMPToken(
  userSeed: string,
  issuanceId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ success: boolean; result?: any; error?: string }> {
  const mptManager = new MPTokenManager("", userSeed, network);
  
  try {
    await mptManager.connect();
    return await mptManager.optIn(issuanceId);
  } finally {
    await mptManager.disconnect();
  }
}

export async function sendMPToken(
  adminSeed: string,
  userSeed: string,
  issuanceId: string,
  destinationAddress: string,
  amount: string,
  fromAdmin: boolean = true,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ success: boolean; result?: any; error?: string }> {
  const mptManager = new MPTokenManager(adminSeed, userSeed, network);
  
  try {
    await mptManager.connect();
    return await mptManager.sendMPT(issuanceId, destinationAddress, amount, fromAdmin);
  } finally {
    await mptManager.disconnect();
  }
}

export async function authorizeMPToken(
  adminSeed: string,
  issuanceId: string,
  holderAddress: string,
  isUnauthorize: boolean = false,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ success: boolean; result?: any; error?: string }> {
  const mptManager = new MPTokenManager(adminSeed, undefined, network);
  
  try {
    await mptManager.connect();
    return await mptManager.authorizeHolder(issuanceId, holderAddress, isUnauthorize);
  } finally {
    await mptManager.disconnect();
  }
}

export async function destroyMPToken(
  adminSeed: string,
  issuanceId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{ success: boolean; result?: any; error?: string }> {
  const mptManager = new MPTokenManager(adminSeed, undefined, network);
  
  try {
    await mptManager.connect();
    return await mptManager.destroyIssuance(issuanceId);
  } finally {
    await mptManager.disconnect();
  }
}
