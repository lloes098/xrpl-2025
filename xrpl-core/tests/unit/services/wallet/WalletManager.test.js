const WalletManager = require('../../../src/services/wallet/WalletManager');

describe('WalletManager', () => {
  let walletManager;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      request: jest.fn(),
      submitAndWait: jest.fn()
    };
    walletManager = new WalletManager(mockClient);
  });

  describe('initializePlatformWallet', () => {
    it('should initialize platform wallet with valid seed', async () => {
      const masterSeed = 'sEdTestSeed123456789012345678901234567890';
      mockClient.request.mockResolvedValue({
        result: {
          account_data: {
            Balance: '1000000000' // 1000 XRP
          }
        }
      });

      await walletManager.initializePlatformWallet(masterSeed);

      expect(walletManager.platformWallet).toBeDefined();
      expect(walletManager.platformWallet.address).toBe('test_address');
    });

    it('should throw error for empty seed', async () => {
      await expect(walletManager.initializePlatformWallet(''))
        .rejects.toThrow('Platform master seed is required');
    });

    it('should throw error for unfunded wallet', async () => {
      const masterSeed = 'sEdTestSeed123456789012345678901234567890';
      mockClient.request.mockResolvedValue({
        result: {
          account_data: {
            Balance: '0'
          }
        }
      });

      await expect(walletManager.initializePlatformWallet(masterSeed))
        .rejects.toThrow('Platform wallet is not funded');
    });
  });

  describe('createIssuerWallet', () => {
    beforeEach(async () => {
      const masterSeed = 'sEdTestSeed123456789012345678901234567890';
      mockClient.request.mockResolvedValue({
        result: {
          account_data: {
            Balance: '1000000000'
          }
        }
      });
      mockClient.submitAndWait.mockResolvedValue({
        result: {
          meta: {
            TransactionResult: 'tesSUCCESS'
          }
        }
      });

      await walletManager.initializePlatformWallet(masterSeed);
    });

    it('should create issuer wallet for project', async () => {
      const projectId = 'test_project_123';
      const wallet = await walletManager.createIssuerWallet(projectId);

      expect(wallet).toBeDefined();
      expect(wallet.address).toBe('test_address');
      expect(walletManager.issuerWallets.has(projectId)).toBe(true);
    });

    it('should fund wallet from platform', async () => {
      const projectId = 'test_project_123';
      await walletManager.createIssuerWallet(projectId);

      expect(mockClient.submitAndWait).toHaveBeenCalled();
    });
  });

  describe('getIssuerWallet', () => {
    it('should return issuer wallet for existing project', async () => {
      const projectId = 'test_project_123';
      await walletManager.createIssuerWallet(projectId);

      const wallet = walletManager.getIssuerWallet(projectId);
      expect(wallet).toBeDefined();
    });

    it('should throw error for non-existent project', () => {
      expect(() => walletManager.getIssuerWallet('non_existent'))
        .toThrow('Issuer wallet not found for project: non_existent');
    });
  });

  describe('getWalletBalance', () => {
    it('should return wallet balance', async () => {
      const address = 'rTestAddress123456789012345678901234567890';
      mockClient.request.mockResolvedValue({
        result: {
          account_data: {
            Balance: '1000000000' // 1000 XRP
          }
        }
      });

      const balance = await walletManager.getWalletBalance(address);

      expect(balance).toEqual({
        xrp: '1000',
        address: address
      });
    });
  });

  describe('submitTransaction', () => {
    it('should submit transaction successfully', async () => {
      const tx = {
        TransactionType: 'Payment',
        Account: 'rTestAccount',
        Destination: 'rTestDestination',
        Amount: '1000000'
      };
      const wallet = {
        address: 'rTestAccount',
        sign: jest.fn().mockReturnValue({ tx_blob: 'signed_tx' })
      };

      mockClient.submitAndWait.mockResolvedValue({
        result: {
          meta: {
            TransactionResult: 'tesSUCCESS'
          },
          hash: 'test_hash'
        }
      });

      const result = await walletManager.submitTransaction(tx, wallet);

      expect(result.success).toBe(true);
      expect(result.hash).toBe('test_hash');
    });

    it('should handle transaction failure', async () => {
      const tx = {
        TransactionType: 'Payment',
        Account: 'rTestAccount',
        Destination: 'rTestDestination',
        Amount: '1000000'
      };
      const wallet = {
        address: 'rTestAccount',
        sign: jest.fn().mockReturnValue({ tx_blob: 'signed_tx' })
      };

      mockClient.submitAndWait.mockResolvedValue({
        result: {
          meta: {
            TransactionResult: 'tecPATH_DRY'
          }
        }
      });

      await expect(walletManager.submitTransaction(tx, wallet))
        .rejects.toThrow('Transaction failed: tecPATH_DRY');
    });
  });

  describe('deactivateIssuerWallet', () => {
    it('should deactivate issuer wallet', async () => {
      const projectId = 'test_project_123';
      await walletManager.createIssuerWallet(projectId);

      walletManager.deactivateIssuerWallet(projectId);

      const issuerData = walletManager.issuerWallets.get(projectId);
      expect(issuerData.isActive).toBe(false);
    });
  });
});
