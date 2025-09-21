import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createXRPLWallet, 
  getAccountBalance, 
  createWalletFromSeed,
  type WalletInfo,
  type CreateWalletResult 
} from '@/lib/xrpl';

export interface WalletState {
  // Wallet Connection State
  isConnected: boolean;
  address: string | null;
  secret: string | null; // Store seed for XRPL operations
  balance: {
    xrp: number;
    rlusd: number;
  };
  networkId: string | null;
  walletType: 'xumm' | 'metamask' | 'xrpl' | null;
  network: 'testnet' | 'mainnet';
  
  // User Profile
  userType: 'creator' | 'investor' | null;
  profile: {
    name: string;
    bio: string;
    avatar: string;
    verified: boolean;
  } | null;
  
  // Connection Methods
  connectWallet: (type: 'xumm' | 'metamask' | 'xrpl', network?: 'testnet' | 'mainnet') => Promise<void>;
  connectWithSeed: (seed: string, network?: 'testnet' | 'mainnet') => Promise<void>;
  createNewWallet: (network?: 'testnet' | 'mainnet') => Promise<void>;
  disconnectWallet: () => void;
  updateBalance: () => Promise<void>;
  
  // Profile Methods
  setUserType: (type: 'creator' | 'investor') => void;
  updateProfile: (profile: Partial<WalletState['profile']>) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial State
      isConnected: false,
      address: null,
      secret: null,
      balance: {
        xrp: 0,
        rlusd: 0,
      },
      networkId: null,
      walletType: null,
      network: 'testnet',
      userType: null,
      profile: null,

      // Wallet Connection Methods
      connectWallet: async (type: 'xumm' | 'metamask' | 'xrpl', network: 'testnet' | 'mainnet' = 'testnet') => {
        try {
          if (type === 'xumm') {
            await connectXummWallet();
          } else if (type === 'metamask') {
            await connectMetaMaskWallet();
          } else if (type === 'xrpl') {
            await connectXRPLWallet(network);
          }
        } catch (error) {
          console.error('Wallet connection failed:', error);
          throw error;
        }
      },

      connectWithSeed: async (seed: string, network: 'testnet' | 'mainnet' = 'testnet') => {
        try {
          const walletResult = createWalletFromSeed(seed, network);
          if (walletResult.success && walletResult.wallet) {
            console.log('Wallet created successfully:', walletResult.wallet.address);
            const balanceResult = await getAccountBalance(walletResult.wallet.address, network);
            console.log('Balance result:', balanceResult);
            
            // 잔액 조회 실패 시에도 지갑은 연결하되, 에러 메시지 표시
            if (balanceResult.error) {
              console.warn('Balance check failed, but wallet connected:', balanceResult.error);
              // Account not found인 경우 사용자에게 알림
              if (balanceResult.error.includes('Account not found')) {
                console.warn('This wallet address does not exist on XRPL network. Please create a new wallet or use a valid address.');
              }
            }
            
            set({
              isConnected: true,
              address: walletResult.wallet.address,
              secret: seed,
              walletType: 'xrpl',
              network: network,
              networkId: network,
              balance: {
                xrp: balanceResult.balance,
                rlusd: 0, // Will be updated separately
              },
            });
          } else {
            throw new Error(walletResult.error || 'Failed to connect with seed');
          }
        } catch (error) {
          console.error('Seed connection failed:', error);
          throw error;
        }
      },

      createNewWallet: async (network: 'testnet' | 'mainnet' = 'testnet') => {
        try {
          const result = await createXRPLWallet(network);
          if (result.success && result.wallet) {
            set({
              isConnected: true,
              address: result.wallet.address,
              secret: result.wallet.secret,
              walletType: 'xrpl',
              network: network,
              networkId: network,
              balance: {
                xrp: parseFloat(result.wallet.balance) / 1_000_000,
                rlusd: 0,
              },
            });
          } else {
            throw new Error(result.error || 'Failed to create wallet');
          }
        } catch (error) {
          console.error('Wallet creation failed:', error);
          throw error;
        }
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          address: null,
          secret: null,
          balance: { xrp: 0, rlusd: 0 },
          networkId: null,
          walletType: null,
          network: 'testnet',
        });
        
        // Clear localStorage
        localStorage.removeItem('wallet-storage');
      },

      updateBalance: async () => {
        const { address, isConnected, network } = get();
        if (!isConnected || !address) {
          console.log('Cannot update balance: not connected or no address');
          return;
        }

        try {
          if (get().walletType === 'xrpl') {
            // Real XRPL balance update
            console.log('Updating balance for address:', address);
            const balanceResult = await getAccountBalance(address, network);
            console.log('Balance update result:', balanceResult);
            
            set({ 
              balance: { 
                xrp: balanceResult.balance, 
                rlusd: 0 // Will be updated when IOU tokens are implemented
              } 
            });
          } else {
            // Mock balance for other wallet types
            const mockBalance = {
              xrp: Math.random() * 1000,
              rlusd: Math.random() * 5000,
            };
            set({ balance: mockBalance });
          }
        } catch (error) {
          console.error('Balance update failed:', error);
        }
      },

      // Profile Methods
      setUserType: (type: 'creator' | 'investor') => {
        set({ userType: type });
      },

      updateProfile: (profileUpdate) => {
        set((state) => ({
          profile: state.profile 
            ? { ...state.profile, ...profileUpdate }
            : { 
                name: '', 
                bio: '', 
                avatar: '', 
                verified: false, 
                ...profileUpdate 
              }
        }));
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        address: state.address,
        secret: state.secret,
        walletType: state.walletType,
        network: state.network,
        networkId: state.networkId,
        userType: state.userType,
        profile: state.profile,
      }),
    }
  )
);

// Wallet connection functions
async function connectXRPLWallet(network: 'testnet' | 'mainnet' = 'testnet') {
  try {
    const result = await createXRPLWallet(network);
    if (result.success && result.wallet) {
      useWalletStore.setState({
        isConnected: true,
        address: result.wallet.address,
        secret: result.wallet.secret,
        walletType: 'xrpl',
        network: network,
        networkId: network,
        balance: {
          xrp: parseFloat(result.wallet.balance) / 1_000_000,
          rlusd: 0,
        },
      });
      return result.wallet.address;
    } else {
      throw new Error(result.error || 'Failed to create XRPL wallet');
    }
  } catch (error) {
    console.error('XRPL wallet connection failed:', error);
    throw error;
  }
}

async function connectXummWallet() {
  // Simulate XUMM connection
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockAddress = 'rXUMMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      useWalletStore.setState({
        isConnected: true,
        address: mockAddress,
        walletType: 'xumm',
        networkId: 'mainnet',
        balance: { xrp: 150.5, rlusd: 2500.0 },
      });
      resolve(mockAddress);
    }, 1500);
  });
}

async function connectMetaMaskWallet() {
  // Simulate MetaMask connection
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockAddress = 'rMETAMASKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      useWalletStore.setState({
        isConnected: true,
        address: mockAddress,
        walletType: 'metamask',
        networkId: 'mainnet',
        balance: { xrp: 89.2, rlusd: 1200.0 },
      });
      resolve(mockAddress);
    }, 1000);
  });
}
