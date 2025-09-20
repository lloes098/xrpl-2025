"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KPICards from "@/components/dashboard/kpi-cards";
import VoteSummaryCards from "@/components/dashboard/vote-summary-cards";
import AllocationPieChart from "@/components/charts/allocation-pie-chart";
import PerformanceLineChart from "@/components/charts/performance-line-chart";
import { 
  useDashboardKPIs, 
  useVoteSummaries, 
  useAllocationChart, 
  usePerformanceChart 
} from "@/lib/queries";
import { useState } from "react";
import { BarChart3, PieChart, Calendar, TrendingUp, Wallet, Vote, Users } from "lucide-react";

export default function DashboardPage() {
  const [performancePeriod, setPerformancePeriod] = useState<"1d" | "7d" | "30d">("7d");
  
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: voteSummaries, isLoading: votesLoading } = useVoteSummaries();
  const { data: allocationData, isLoading: allocationLoading } = useAllocationChart();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceChart(performancePeriod);

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
            <h1 className="text-3xl font-bold text-white">대시보드</h1>
            <p className="text-gray-400 mt-1">XRPL ETF 플랫폼 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && <KPICards data={kpis} isLoading={kpisLoading} />}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Allocation */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                <CardTitle>포트폴리오 구성</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {allocationLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : allocationData ? (
                <AllocationPieChart currentData={allocationData} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  데이터를 불러올 수 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
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

        {/* Vote Summaries */}
        {voteSummaries && (
          <VoteSummaryCards data={voteSummaries} isLoading={votesLoading} />
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>빠른 작업</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="secondary" 
                className="h-16 flex-col space-y-2"
                onClick={() => window.location.href = '/portfolio'}
              >
                <Wallet className="w-6 h-6" />
                <span>포트폴리오 관리</span>
              </Button>
              <Button 
                variant="secondary" 
                className="h-16 flex-col space-y-2"
                onClick={() => window.location.href = '/vote'}
              >
                <Vote className="w-6 h-6" />
                <span>투표 참여</span>
              </Button>
              <Button 
                variant="secondary" 
                className="h-16 flex-col space-y-2"
                onClick={() => window.location.href = '/managers'}
              >
                <Users className="w-6 h-6" />
                <span>매니저 현황</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
