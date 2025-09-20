"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/lib/types";
import { formatPercentage } from "@/lib/utils";
import { format } from "date-fns";

interface PerformanceLineChartProps {
  data: ChartDataPoint[];
  period?: "1d" | "7d" | "30d";
}

export default function PerformanceLineChart({ data, period = "7d" }: PerformanceLineChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (period) {
      case "1d":
        return format(date, "HH:mm");
      case "7d":
        return format(date, "MM/dd");
      case "30d":
        return format(date, "MM/dd");
      default:
        return format(date, "MM/dd");
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const change = value - 100;
      
      return (
        <div className="bg-dark-800/90 border border-cyan-500/20 rounded-lg p-3 shadow-glow backdrop-blur-md">
          <p className="text-cyan-400 font-semibold">
            {format(new Date(label), "yyyy-MM-dd HH:mm")}
          </p>
          <p className="text-white">수익률: {formatPercentage(change)}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate gradient colors based on performance
  const isPositive = data.length > 0 && data[data.length - 1].value > data[0].value;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "#06b6d4" : "#ef4444"}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "#06b6d4" : "#ef4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value) => formatPercentage(value - 100)}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "#06b6d4" : "#ef4444"}
            strokeWidth={2}
            dot={false}
            fill="url(#performanceGradient)"
            activeDot={{
              r: 6,
              fill: isPositive ? "#06b6d4" : "#ef4444",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
