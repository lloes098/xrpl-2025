"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartData, Allocation } from "@/lib/types";
import { formatCurrency, formatPercentage, getAssetColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AllocationPieChartProps {
  currentData: PieChartData[];
  proposedChanges?: Allocation[] | null;
  totalValue?: number;
  showComparison?: boolean;
}

export default function AllocationPieChart({ 
  currentData, 
  proposedChanges, 
  totalValue = 125847.32,
  showComparison = false 
}: AllocationPieChartProps) {
  const [viewMode, setViewMode] = useState<"current" | "proposed">("current");

  // Convert proposed changes to chart data
  const proposedData: PieChartData[] | null = proposedChanges
    ? proposedChanges.map((allocation) => ({
        asset: allocation.asset,
        value: (totalValue * allocation.weightPct) / 100,
        percentage: allocation.weightPct,
        color: getAssetColor(allocation.asset),
      }))
    : null;

  const displayData = viewMode === "proposed" && proposedData ? proposedData : currentData;
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-800/90 border border-cyan-500/20 rounded-lg p-3 shadow-glow backdrop-blur-md">
          <p className="text-cyan-400 font-semibold">{data.asset}</p>
          <p className="text-white">{formatCurrency(data.value)}</p>
          <p className="text-gray-300">{formatPercentage(data.percentage)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Toggle Buttons */}
      {showComparison && proposedData && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant={viewMode === "current" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("current")}
          >
            현재 구성
          </Button>
          <Button
            variant={viewMode === "proposed" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setViewMode("proposed")}
          >
            제안 적용 후
          </Button>
        </div>
      )}

      {/* Chart Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">
          {viewMode === "proposed" ? "제안 적용 후 포트폴리오" : "현재 포트폴리오"}
        </h3>
        {showComparison && proposedData && (
          <p className="text-sm text-gray-400 mt-1">
            {viewMode === "proposed" 
              ? "새로운 자산 배분 비율"
              : "현재 자산 배분 비율"
            }
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      {showComparison && proposedData && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-white mb-3">변경 사항 비교</h4>
          <div className="bg-dark-800/30 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 mb-3">
              <div>자산</div>
              <div className="text-center">현재</div>
              <div className="text-center">제안 후</div>
              <div className="text-center">변화</div>
            </div>
            {currentData.map((current) => {
              const proposed = proposedData.find(p => p.asset === current.asset);
              const change = proposed ? proposed.percentage - current.percentage : -current.percentage;
              
              return (
                <div key={current.asset} className="grid grid-cols-4 gap-4 text-sm py-2 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: current.color }}
                    />
                    <span className="text-white font-medium">{current.asset}</span>
                  </div>
                  <div className="text-center text-gray-300">
                    {formatPercentage(current.percentage)}
                  </div>
                  <div className="text-center text-gray-300">
                    {proposed ? formatPercentage(proposed.percentage) : "0%"}
                  </div>
                  <div className={`text-center font-medium ${
                    change > 0 ? "text-green-400" :
                    change < 0 ? "text-red-400" : "text-gray-400"
                  }`}>
                    {change !== 0 ? (change > 0 ? "+" : "") + formatPercentage(change) : "-"}
                  </div>
                </div>
              );
            })}
            {/* Show new assets in proposed allocation */}
            {proposedData?.filter(proposed => 
              !currentData.some(current => current.asset === proposed.asset)
            ).map((newAsset) => (
              <div key={newAsset.asset} className="grid grid-cols-4 gap-4 text-sm py-2 border-t border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: newAsset.color }}
                  />
                  <span className="text-white font-medium">{newAsset.asset}</span>
                </div>
                <div className="text-center text-gray-400">0%</div>
                <div className="text-center text-gray-300">
                  {formatPercentage(newAsset.percentage)}
                </div>
                <div className="text-center font-medium text-green-400">
                  +{formatPercentage(newAsset.percentage)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
