import { useQuery } from "@tanstack/react-query";
import {
  mockProposals,
  mockPortfolioState,
  mockUserPortfolio,
  mockManagers,
  mockDashboardKPIs,
  mockVoteSummaries,
  mockPerformanceData,
  mockPieChartData,
  mockTransactions,
} from "./mock-data";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard queries
export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: async () => {
      await delay(500);
      return mockDashboardKPIs;
    },
  });
};

export const useVoteSummaries = () => {
  return useQuery({
    queryKey: ["dashboard", "vote-summaries"],
    queryFn: async () => {
      await delay(300);
      return mockVoteSummaries;
    },
  });
};

export const usePerformanceChart = (period: "1d" | "7d" | "30d" = "7d") => {
  return useQuery({
    queryKey: ["dashboard", "performance", period],
    queryFn: async () => {
      await delay(400);
      return mockPerformanceData;
    },
  });
};

export const useAllocationChart = () => {
  return useQuery({
    queryKey: ["dashboard", "allocation"],
    queryFn: async () => {
      await delay(300);
      return mockPieChartData;
    },
  });
};

// Proposal queries
export const useProposals = () => {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      await delay(600);
      return mockProposals;
    },
  });
};

export const useProposal = (id: string) => {
  return useQuery({
    queryKey: ["proposals", id],
    queryFn: async () => {
      await delay(400);
      return mockProposals.find((p) => p.id === id);
    },
    enabled: !!id,
  });
};

// Portfolio queries
export const usePortfolioState = () => {
  return useQuery({
    queryKey: ["portfolio", "state"],
    queryFn: async () => {
      await delay(500);
      return mockPortfolioState;
    },
  });
};

export const useUserPortfolio = () => {
  return useQuery({
    queryKey: ["portfolio", "user"],
    queryFn: async () => {
      await delay(400);
      return mockUserPortfolio;
    },
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ["portfolio", "transactions"],
    queryFn: async () => {
      await delay(500);
      return mockTransactions;
    },
  });
};

// Manager queries
export const useManagers = () => {
  return useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      await delay(600);
      return mockManagers;
    },
  });
};

export const useManager = (id: string) => {
  return useQuery({
    queryKey: ["managers", id],
    queryFn: async () => {
      await delay(400);
      return mockManagers.find((m) => m.id === id);
    },
    enabled: !!id,
  });
};
