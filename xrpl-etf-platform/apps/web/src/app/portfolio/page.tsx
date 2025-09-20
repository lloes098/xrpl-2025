"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionModal from "@/components/portfolio/transaction-modal";
import TransactionHistory from "@/components/portfolio/transaction-history";
import AllocationPieChart from "@/components/charts/allocation-pie-chart";
import PerformanceLineChart from "@/components/charts/performance-line-chart";
import { 
  usePortfolioState, 
  useUserPortfolio, 
  useTransactions,
  usePerformanceChart,
  useAllocationChart
} from "@/lib/queries";
import { useWalletStore } from "@/stores/wallet-store";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatPercentage, getAssetColor, cn } from "@/lib/utils";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowDownLeft, 
  ArrowUpRight,
  PieChart,
  BarChart3,
  Calendar,
  Coins
} from "lucide-react";

export default function PortfolioPage() {
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    type: "deposit" | "withdraw";
  }>({ isOpen: false, type: "deposit" });
  
  const [performancePeriod, setPerformancePeriod] = useState<"1d" | "7d" | "30d">("7d");

  const { data: portfolioState, isLoading: portfolioLoading } = usePortfolioState();
  const { data: userPortfolio, isLoading: userLoading } = useUserPortfolio();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceChart(performancePeriod);
  const { data: allocationData, isLoading: allocationLoading } = useAllocationChart();
  
  const { isConnected, balance } = useWalletStore();
  const { addToast } = useAppStore();

  const handleTransaction = (amount: number) => {
    const isDeposit = transactionModal.type === "deposit";
    
    addToast({
      message: `${formatCurrency(amount, isDeposit ? "XRP" : "ETFX")} ${isDeposit ? "입금" : "환매"}이 완료되었습니다`,
      type: "success",
    });
  };

  const openTransactionModal = (type: "deposit" | "withdraw") => {
    if (!isConnected) {
      addToast({
        message: "지갑을 먼저 연결해주세요",
        type: "warning",
      });
      return;
    }
    
    setTransactionModal({ isOpen: true, type });
  };

  const periodButtons = [
    { value: "1d" as const, label: "1일" },
    { value: "7d" as const, label: "7일" },
    { value: "30d" as const, label: "30일" },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">포트폴리오</h1>
            <p className="text-gray-400 mt-1">내 투자 현황과 자산을 관리하세요</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* ETFX Balance */}
          <Card variant="glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">ETFX 잔고</p>
                  <p className="text-2xl font-bold text-white">
                    {userPortfolio ? formatCurrency(userPortfolio.etfxBalance, "ETFX") : "0.00 ETFX"}
                  </p>
                  <p className="text-sm text-gray-400">
                    평균 매입가: {userPortfolio ? formatCurrency(userPortfolio.avgBuyPrice) : "0.00 XRP"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staked XRP */}
          <Card variant="glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">예치 XRP</p>
                  <p className="text-2xl font-bold text-white">
                    {userPortfolio ? formatCurrency(userPortfolio.stakedXRP) : "0.00 XRP"}
                  </p>
                  <p className="text-sm text-cyan-400">예치중</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unrealized PnL */}
          <Card variant="glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">미실현 손익</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    userPortfolio && userPortfolio.unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {userPortfolio ? (
                      <>
                        {userPortfolio.unrealizedPnl >= 0 ? "+" : ""}
                        {formatCurrency(userPortfolio.unrealizedPnl)}
                      </>
                    ) : "0.00 XRP"}
                  </p>
                  <p className={cn(
                    "text-sm font-medium",
                    userPortfolio && userPortfolio.unrealizedPnlPct >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {userPortfolio ? formatPercentage(userPortfolio.unrealizedPnlPct) : "0.00%"}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center",
                  userPortfolio && userPortfolio.unrealizedPnl >= 0 
                    ? "from-green-500 to-emerald-500" 
                    : "from-red-500 to-pink-500"
                )}>
                  {userPortfolio && userPortfolio.unrealizedPnl >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card variant="glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">지갑 잔고</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-sm text-gray-400">사용 가능</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 거래</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => openTransactionModal("deposit")}
                className="h-16 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                disabled={!isConnected}
              >
                <ArrowDownLeft className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">XRP 입금</div>
                  <div className="text-xs opacity-80">ETFX 토큰으로 교환</div>
                </div>
              </Button>

              <Button
                onClick={() => openTransactionModal("withdraw")}
                variant="secondary"
                className="h-16 flex items-center justify-center space-x-3 hover:bg-red-500/20 hover:border-red-500/50"
                disabled={!isConnected || !userPortfolio || userPortfolio.etfxBalance === 0}
              >
                <ArrowUpRight className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">ETFX 환매</div>
                  <div className="text-xs opacity-80">XRP로 교환</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                <span>자산 구성</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allocationLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : allocationData ? (
                <AllocationPieChart data={allocationData} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  데이터를 불러올 수 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <CardTitle>수익률 추이</CardTitle>
              </div>
              <div className="flex space-x-1">
                {periodButtons.map((button) => (
                  <Button
                    key={button.value}
                    variant={performancePeriod === button.value ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setPerformancePeriod(button.value)}
                    className="text-xs"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : performanceData ? (
                <PerformanceLineChart data={performanceData} period={performancePeriod} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  데이터를 불러올 수 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Asset Breakdown */}
        {portfolioState && (
          <Card>
            <CardHeader>
              <CardTitle>자산별 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioState.allocations.map((allocation) => (
                  <div
                    key={allocation.asset}
                    className="p-4 bg-dark-800/30 rounded-lg border border-gray-800/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getAssetColor(allocation.asset) }}
                        />
                        <span className="font-medium text-white">{allocation.asset}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatPercentage(allocation.weightPct)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">예상 가치</span>
                        <span className="text-white">
                          {formatCurrency((portfolioState.totalValueXRP * allocation.weightPct) / 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        {transactions && (
          <TransactionHistory 
            transactions={transactions} 
            isLoading={transactionsLoading} 
          />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        type={transactionModal.type}
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ ...transactionModal, isOpen: false })}
        onSubmit={handleTransaction}
        maxAmount={userPortfolio?.etfxBalance || 0}
      />
    </div>
  );
}
