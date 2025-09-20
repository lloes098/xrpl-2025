"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardKPIs } from "@/lib/types";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Vote, Coins, Users } from "lucide-react";

interface KPICardsProps {
  data: DashboardKPIs;
  isLoading?: boolean;
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  const kpis = [
    {
      title: "총 예치 XRP",
      value: formatCurrency(data.totalStakedXRP),
      icon: Wallet,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "일일 PnL",
      value: formatCurrency(data.dailyPnl),
      subtitle: formatPercentage(data.dailyPnlPct),
      icon: data.dailyPnlPct >= 0 ? TrendingUp : TrendingDown,
      color: data.dailyPnlPct >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500",
      isPositive: data.dailyPnlPct >= 0,
    },
    {
      title: "투표 진행 수",
      value: data.activeProposals.toString(),
      subtitle: "활성 제안",
      icon: Vote,
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "내 ETFX 잔고",
      value: formatCurrency(data.myETFXBalance, "ETFX"),
      subtitle: `거버넌스 토큰: ${data.governanceTokens}`,
      icon: Coins,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-24" />
                  <div className="h-6 bg-gray-700 rounded w-32" />
                  <div className="h-3 bg-gray-700 rounded w-20" />
                </div>
                <div className="w-12 h-12 bg-gray-700 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        
        return (
          <Card key={index} variant="glow" className="group hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-medium">{kpi.title}</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    kpi.isPositive !== undefined
                      ? kpi.isPositive
                        ? "text-green-400"
                        : "text-red-400"
                      : "text-white"
                  )}>
                    {kpi.value}
                  </p>
                  {kpi.subtitle && (
                    <p className={cn(
                      "text-sm font-medium",
                      kpi.isPositive !== undefined
                        ? kpi.isPositive
                          ? "text-green-400"
                          : "text-red-400"
                        : "text-cyan-400"
                    )}>
                      {kpi.subtitle}
                    </p>
                  )}
                </div>
                
                <div className={cn(
                  "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                  kpi.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
