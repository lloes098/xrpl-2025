"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ManagerCard from "@/components/managers/manager-card";
import { useManagers } from "@/lib/queries";
import { useAppStore } from "@/stores/app-store";
import { Manager } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { 
  Users, 
  Shield, 
  TrendingUp, 
  Award, 
  Filter,
  UserCheck,
  UserX,
  AlertTriangle
} from "lucide-react";

type ManagerFilter = "all" | "active" | "inactive" | "high-performance" | "low-performance";

export default function ManagersPage() {
  const [selectedFilter, setSelectedFilter] = useState<ManagerFilter>("all");
  
  const { data: managers, isLoading } = useManagers();
  const { addToast } = useAppStore();

  const filters = [
    { value: "all" as const, label: "전체", count: managers?.length || 0 },
    { value: "active" as const, label: "활성", count: managers?.filter(m => m.isActive).length || 0 },
    { value: "inactive" as const, label: "비활성", count: managers?.filter(m => !m.isActive).length || 0 },
    { value: "high-performance" as const, label: "고성과", count: managers?.filter(m => m.performance7d >= 5).length || 0 },
    { value: "low-performance" as const, label: "저성과", count: managers?.filter(m => m.performance7d < 0).length || 0 },
  ];

  const filteredManagers = managers?.filter(manager => {
    switch (selectedFilter) {
      case "all":
        return true;
      case "active":
        return manager.isActive;
      case "inactive":
        return !manager.isActive;
      case "high-performance":
        return manager.performance7d >= 5;
      case "low-performance":
        return manager.performance7d < 0;
      default:
        return true;
    }
  });

  const handleReport = (managerId: string) => {
    // 실제로는 신고 모달을 띄우거나 API 호출
    addToast({
      message: "매니저 신고가 접수되었습니다. 검토 후 조치하겠습니다.",
      type: "info",
    });
  };

  const handleRate = (managerId: string, rating: number) => {
    // 실제로는 평가 모달을 띄우거나 API 호출
    addToast({
      message: "매니저 평가가 제출되었습니다.",
      type: "success",
    });
  };

  // Statistics
  const totalDeposit = managers?.reduce((sum, m) => sum + m.depositAmount, 0) || 0;
  const avgPerformance = managers?.length 
    ? managers.reduce((sum, m) => sum + m.performance7d, 0) / managers.length 
    : 0;
  const activeManagers = managers?.filter(m => m.isActive).length || 0;
  const avgReputation = managers?.length
    ? managers.reduce((sum, m) => sum + m.reputation, 0) / managers.length
    : 0;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">매니저 보드</h1>
            <p className="text-gray-400 mt-1">ETF 매니저들의 성과와 신뢰도를 확인하세요</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{activeManagers}</div>
            <div className="text-sm text-gray-400">활성 매니저</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{managers?.length || 0}</div>
              <div className="text-gray-400">총 매니저 수</div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(totalDeposit)}
              </div>
              <div className="text-gray-400">총 보증금</div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${avgPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(avgPerformance)}
              </div>
              <div className="text-gray-400">평균 7일 성과</div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {avgReputation.toFixed(1)}
              </div>
              <div className="text-gray-400">평균 신뢰도</div>
            </CardContent>
          </Card>
        </div>

        {/* Manager Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-400 mb-1">{activeManagers}</div>
              <div className="text-gray-400">활성 매니저</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <UserX className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-400 mb-1">
                {(managers?.length || 0) - activeManagers}
              </div>
              <div className="text-gray-400">비활성 매니저</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-yellow-400 mb-1">
                {managers?.filter(m => m.reputation < 70).length || 0}
              </div>
              <div className="text-gray-400">주의 필요</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <span>매니저 필터</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="flex items-center space-x-2"
                >
                  <span>{filter.label}</span>
                  <Badge variant="info" className="ml-1">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Managers Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-24" />
                          <div className="h-3 bg-gray-700 rounded w-16" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-16 bg-gray-700 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredManagers && filteredManagers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredManagers.map((manager) => (
                <ManagerCard
                  key={manager.id}
                  manager={manager}
                  onReport={handleReport}
                  onRate={handleRate}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {selectedFilter === "all" ? "매니저가 없습니다" : `${filters.find(f => f.value === selectedFilter)?.label} 매니저가 없습니다`}
                </h3>
                <p className="text-gray-500">
                  {selectedFilter === "all" 
                    ? "새로운 매니저가 등록되면 여기에 표시됩니다"
                    : "다른 필터를 선택해보세요"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notice */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">매니저 평가 및 신고 안내</h4>
                <p className="text-yellow-300/80 text-sm">
                  매니저의 성과와 행동을 평가하고 문제가 있을 경우 신고할 수 있습니다. 
                  모든 신고는 검토 후 적절한 조치가 취해집니다. 
                  현재는 해커톤용 UI로 실제 기능은 구현되지 않았습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
