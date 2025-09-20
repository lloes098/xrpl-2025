"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Manager } from "@/lib/types";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Flag
} from "lucide-react";

interface ManagerCardProps {
  manager: Manager;
  onReport?: (managerId: string) => void;
  onRate?: (managerId: string, rating: number) => void;
}

export default function ManagerCard({ manager, onReport, onRate }: ManagerCardProps) {
  const getPerformanceColor = (performance: number) => {
    if (performance >= 0) return "text-green-400";
    return "text-red-400";
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 90) return "text-green-400";
    if (reputation >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 90) return <Badge variant="success">우수</Badge>;
    if (reputation >= 70) return <Badge variant="warning">보통</Badge>;
    return <Badge variant="danger">주의</Badge>;
  };

  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-glow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                manager.isActive 
                  ? "bg-gradient-to-br from-cyan-500 to-blue-500" 
                  : "bg-gray-600"
              )}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {manager.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={manager.isActive ? "success" : "default"}>
                    {manager.isActive ? "활성" : "비활성"}
                  </Badge>
                  {getReputationBadge(manager.reputation)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Star className={cn(
                  "w-4 h-4",
                  getReputationColor(manager.reputation)
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  getReputationColor(manager.reputation)
                )}>
                  {manager.reputation}
                </span>
              </div>
              <div className="text-xs text-gray-400">평점</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">보증금</span>
              </div>
              <div className="text-lg font-bold text-white">
                {formatCurrency(manager.depositAmount)}
              </div>
            </div>

            <div className="bg-dark-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                {manager.performance7d >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-xs text-gray-400">7일 성과</span>
              </div>
              <div className={cn(
                "text-lg font-bold",
                getPerformanceColor(manager.performance7d)
              )}>
                {formatPercentage(manager.performance7d)}
              </div>
            </div>

            <div className="bg-dark-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">권한 비율</span>
              </div>
              <div className="text-lg font-bold text-white">
                {formatPercentage(manager.authorityRatio)}
              </div>
            </div>

            <div className="bg-dark-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">제안 채택률</span>
              </div>
              <div className="text-lg font-bold text-white">
                {formatPercentage(manager.proposalAcceptanceRate)}
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">권한 비율</span>
                <span className="text-white">{formatPercentage(manager.authorityRatio)}</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${manager.authorityRatio}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">제안 채택률</span>
                <span className="text-white">{formatPercentage(manager.proposalAcceptanceRate)}</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${manager.proposalAcceptanceRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">신뢰도</span>
                <span className={getReputationColor(manager.reputation)}>
                  {manager.reputation}/100
                </span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    manager.reputation >= 90 
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : manager.reputation >= 70
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                      : "bg-gradient-to-r from-red-500 to-red-600"
                  )}
                  style={{ width: `${manager.reputation}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t border-gray-800/50">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => onRate?.(manager.id, 5)}
            >
              <Star className="w-4 h-4 mr-1" />
              평가
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
              onClick={() => onReport?.(manager.id)}
            >
              <Flag className="w-4 h-4 mr-1" />
              신고
            </Button>
          </div>

          {/* Performance Indicator */}
          <div className="text-center">
            <div className={cn(
              "inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium",
              manager.performance7d >= 5 
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : manager.performance7d >= 0
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {manager.performance7d >= 5 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>고성과</span>
                </>
              ) : manager.performance7d >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>안정적</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>주의 필요</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
