"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProposalCard from "@/components/vote/proposal-card";
import ProposalDetailDrawer from "@/components/vote/proposal-detail-drawer";
import VoteResultBanner from "@/components/vote/vote-result-banner";
import { useProposals } from "@/lib/queries";
import { useWalletStore } from "@/stores/wallet-store";
import { useAppStore } from "@/stores/app-store";
import { Proposal } from "@/lib/types";
import { Vote, Filter, Users, Clock, TrendingUp } from "lucide-react";

type ProposalFilter = "all" | "active" | "passed" | "rejected" | "expired";

export default function VotePage() {
  const [selectedFilter, setSelectedFilter] = useState<ProposalFilter>("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [resultBanner, setResultBanner] = useState<{
    proposal: Proposal | null;
    isVisible: boolean;
  }>({ proposal: null, isVisible: false });
  
  const { data: proposals, isLoading } = useProposals();
  const { isConnected, governanceTokens = 0 } = useWalletStore();
  const { addToast } = useAppStore();

  const filters = [
    { value: "all" as const, label: "전체", count: proposals?.length || 0 },
    { value: "active" as const, label: "진행중", count: proposals?.filter(p => p.status === "active").length || 0 },
    { value: "passed" as const, label: "승인됨", count: proposals?.filter(p => p.status === "passed").length || 0 },
    { value: "rejected" as const, label: "거부됨", count: proposals?.filter(p => p.status === "rejected").length || 0 },
    { value: "expired" as const, label: "만료됨", count: proposals?.filter(p => p.status === "expired").length || 0 },
  ];

  const filteredProposals = proposals?.filter(proposal => {
    if (selectedFilter === "all") return true;
    return proposal.status === selectedFilter;
  });

  const handleVote = (proposalId: string, vote: "for" | "against") => {
    if (!isConnected) {
      addToast({
        message: "투표하려면 지갑을 연결해주세요",
        type: "warning",
      });
      return;
    }

    if (governanceTokens === 0) {
      addToast({
        message: "투표하려면 거버넌스 토큰이 필요합니다",
        type: "warning",
      });
      return;
    }

    // 실제 투표 로직은 여기에 구현
    addToast({
      message: `${vote === "for" ? "찬성" : "반대"} 투표가 제출되었습니다`,
      type: "success",
    });

    // Close drawer after voting
    setIsDrawerOpen(false);

    // 데모용: 투표 후 집계 완료 배너 표시 (실제로는 다른 조건에서)
    const proposal = proposals?.find(p => p.id === proposalId);
    if (proposal) {
      setTimeout(() => {
        setResultBanner({ proposal, isVisible: true });
      }, 2000); // 2초 후 집계 완료 시뮬레이션
    }
  };

  const handleRecordOnChain = async (proposalId: string): Promise<string> => {
    // 실제 XRPL 메모 트랜잭션 로직
    await new Promise(resolve => setTimeout(resolve, 3000)); // 시뮬레이션 지연
    
    // Mock 트랜잭션 해시 생성
    const mockTxHash = `${Date.now().toString(16).toUpperCase()}ABC123DEF456`;
    
    addToast({
      message: "투표 결과가 XRPL에 성공적으로 기록되었습니다",
      type: "success",
    });
    
    return mockTxHash;
  };

  const handleViewDetails = (proposalId: string) => {
    const proposal = proposals?.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setIsDrawerOpen(true);
    }
  };

  const activeProposalsCount = proposals?.filter(p => p.status === "active").length || 0;
  const totalVotes = proposals?.reduce((sum, p) => sum + p.totalVotes, 0) || 0;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">거버넌스 투표</h1>
            <p className="text-gray-400 mt-1">ETF 포트폴리오 변경안에 투표하고 의견을 제시하세요</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{governanceTokens}</div>
            <div className="text-sm text-gray-400">보유 거버넌스 토큰</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{activeProposalsCount}</div>
              <div className="text-gray-400">진행중인 투표</div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{totalVotes.toLocaleString()}</div>
              <div className="text-gray-400">총 투표 수</div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {proposals?.filter(p => p.myVote).length || 0}
              </div>
              <div className="text-gray-400">내 참여 투표</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <span>제안 필터</span>
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

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-400">지갑 연결이 필요합니다</h4>
                  <p className="text-yellow-300/80 text-sm">투표에 참여하려면 지갑을 연결해주세요</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-6 bg-gray-700 rounded w-3/4" />
                          <div className="h-4 bg-gray-700 rounded w-1/2" />
                        </div>
                        <div className="w-20 h-6 bg-gray-700 rounded" />
                      </div>
                      <div className="h-20 bg-gray-700 rounded" />
                      <div className="h-3 bg-gray-700 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProposals && filteredProposals.length > 0 ? (
            <div className="space-y-6">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onVote={handleVote}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {selectedFilter === "all" ? "제안이 없습니다" : `${filters.find(f => f.value === selectedFilter)?.label} 제안이 없습니다`}
                </h3>
                <p className="text-gray-500">
                  {selectedFilter === "all" 
                    ? "새로운 제안이 등록되면 여기에 표시됩니다"
                    : "다른 필터를 선택해보세요"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Proposal Detail Drawer */}
      <ProposalDetailDrawer
        proposal={selectedProposal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onVote={handleVote}
      />

      {/* Vote Result Banner */}
      {resultBanner.proposal && (
        <VoteResultBanner
          proposal={resultBanner.proposal}
          isVisible={resultBanner.isVisible}
          onClose={() => setResultBanner({ proposal: null, isVisible: false })}
          onRecordOnChain={handleRecordOnChain}
        />
      )}
    </div>
  );
}
