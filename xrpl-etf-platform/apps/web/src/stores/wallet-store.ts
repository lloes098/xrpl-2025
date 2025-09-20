import { create } from "zustand";
import { WalletState, NetworkType } from "@/lib/types";

interface WalletStore extends WalletState {
  connect: (address: string) => void;
  disconnect: () => void;
  setNetwork: (network: NetworkType) => void;
  setBalance: (balance: number) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  isConnected: false,
  network: "testnet",
  balance: 0,
  
  connect: (address: string) =>
    set({ isConnected: true, address, balance: 1000 }), // Mock balance
  
  disconnect: () =>
    set({ isConnected: false, address: undefined, balance: 0 }),
  
  setNetwork: (network: NetworkType) => set({ network }),
  
  setBalance: (balance: number) => set({ balance }),
}));
