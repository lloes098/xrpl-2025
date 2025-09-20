import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number, currency: string = "XRP"): string {
  return `${formatNumber(value)} ${currency}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatNumber(value)}%`;
}

export function formatTimeLeft(endTime: string): string {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "종료됨";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

export function getAssetColor(asset: string): string {
  const colors: Record<string, string> = {
    BTC: "#F7931A",
    ETH: "#627EEA",
    XRP: "#00AAE4",
    SOL: "#9945FF",
    VNXAU: "#FFD700",
    RLUSD: "#00D4AA",
  };
  return colors[asset] || "#6B7280";
}

export function truncateAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function getVoteStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "passed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "expired":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export function calculateVotePercentage(votesFor: number, votesAgainst: number, total: number): {
  forPct: number;
  againstPct: number;
  abstainPct: number;
} {
  const forPct = total > 0 ? (votesFor / total) * 100 : 0;
  const againstPct = total > 0 ? (votesAgainst / total) * 100 : 0;
  const abstainPct = 100 - forPct - againstPct;

  return { forPct, againstPct, abstainPct };
}
