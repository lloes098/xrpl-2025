import { create } from "zustand";
import { AppSettings } from "@/lib/types";

interface AppStore extends AppSettings {
  setNetwork: (network: AppSettings["network"]) => void;
  toggleDeveloperMode: () => void;
  toggleMockData: () => void;
  
  // Toast notifications
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  }>;
  addToast: (toast: Omit<AppStore["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  network: "testnet",
  developerMode: true,
  mockDataEnabled: true,
  toasts: [],
  
  setNetwork: (network) => set({ network }),
  
  toggleDeveloperMode: () =>
    set((state) => ({ developerMode: !state.developerMode })),
  
  toggleMockData: () =>
    set((state) => ({ mockDataEnabled: !state.mockDataEnabled })),
  
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).slice(2) },
      ],
    })),
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
