import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WalletState {
  // Wallet Connection State
  isConnected: boolean;
  address: string | null;
  balance: {
    xrp: number;
    rlusd: number;
  };
  networkId: string | null;
  walletType: 'xumm' | 'metamask' | null;
  
  // User Profile
  userType: 'creator' | 'investor' | null;
  profile: {
    name: string;
    bio: string;
    avatar: string;
    verified: boolean;
  } | null;
  
  // Connection Methods
  connectWallet: (type: 'xumm' | 'metamask') => Promise<void>;
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
      balance: {
        xrp: 0,
        rlusd: 0,
      },
      networkId: null,
      walletType: null,
      userType: null,
      profile: null,

      // Wallet Connection Methods
      connectWallet: async (type: 'xumm' | 'metamask') => {
        try {
          if (type === 'xumm') {
            // XUMM wallet connection logic
            await connectXummWallet();
          } else if (type === 'metamask') {
            // MetaMask wallet connection logic
            await connectMetaMaskWallet();
          }
        } catch (error) {
          console.error('Wallet connection failed:', error);
          throw error;
        }
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          address: null,
          balance: { xrp: 0, rlusd: 0 },
          networkId: null,
          walletType: null,
        });
      },

      updateBalance: async () => {
        const { address, isConnected } = get();
        if (!isConnected || !address) return;

        try {
          // Mock balance update - replace with actual XRPL API call
          const mockBalance = {
            xrp: Math.random() * 1000,
            rlusd: Math.random() * 5000,
          };
          
          set({ balance: mockBalance });
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
        address: state.address,
        userType: state.userType,
        profile: state.profile,
      }),
    }
  )
);

// Mock wallet connection functions - replace with actual implementations
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
