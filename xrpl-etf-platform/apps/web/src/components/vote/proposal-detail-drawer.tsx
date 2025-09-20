"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Proposal } from "@/lib/types";
import { 
  formatTimeLeft, 
  calculateVotePercentage, 
  getVoteStatusColor,
  getAssetColor,
  formatPercentage
} from "@/lib/utils";
import { 
  X, 
  User, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Vote,
  FileText,
  BarChart3,
  CheckCircle
} from "lucide-react";

interface ProposalDetailDrawerProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (proposalId: string, vote: "for" | "against") => void;
}

export default function ProposalDetailDrawer({ 
  proposal, 
  isOpen, 
  onClose, 
  onVote 
}: ProposalDetailDrawerProps) {
  const [selectedVote, setSelectedVote] = useState<"for" | "against" | null>(null);

  if (!proposal) return null;

  const { forPct, againstPct } = calculateVotePercentage(
    proposal.votesFor,
    proposal.votesAgainst,
    proposal.totalVotes
  );

  const isActive = proposal.status === "active";
  const hasVoted = proposal.myVote !== undefined;

  const handleVoteSubmit = () => {
    if (selectedVote && proposal) {
      onVote(proposal.id, selectedVote);
      setSelectedVote(null);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-2xl bg-gradient-card backdrop-blur-md border-l border-gray-800/50 
        transform transition-transform duration-300 z-50 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {proposal.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{proposal.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeLeft(proposal.endsAt)}</span>
                </div>
                <Badge className={getVoteStatusColor(proposal.status)}>
                  {proposal.status === "active" ? "진행중" : 
                   proposal.status === "passed" ? "승인됨" :
                   proposal.status === "rejected" ? "거부됨" : "만료됨"}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Rationale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>제안 근거</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {proposal.rationale}
              </p>
            </CardContent>
          </Card>

          {/* Portfolio Changes Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>포트폴리오 변경 미리보기</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.changes.map((change, index) => (
                  <div key={change.asset} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getAssetColor(change.asset) }}
                      />
                      <span className="font-medium text-white">{change.asset}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {formatPercentage(change.weightPct)}
                      </div>
                      {/* 이전 비중과 비교 표시 (실제로는 현재 포트폴리오 데이터와 비교) */}
                      <div className="text-xs text-gray-400">
                        변경 후 비중
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vote Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="w-5 h-5 text-cyan-400" />
                <span>투표 현황</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {proposal.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-gray-400">총 투표 수</div>
                </div>

                <div className="w-full bg-dark-800 rounded-full h-4">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{ width: `${forPct}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-500"
                      style={{ width: `${againstPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">찬성</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {forPct.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {proposal.votesFor.toLocaleString()}표
                    </div>
                  </div>

                  <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">반대</span>
                    </div>
                    <div className="text-xl font-bold text-red-400">
                      {againstPct.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {proposal.votesAgainst.toLocaleString()}표
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting Actions */}
          {isActive && !hasVoted && (
            <Card>
              <CardHeader>
                <CardTitle>투표하기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedVote === "against" ? "danger" : "secondary"}
                      onClick={() => setSelectedVote("against")}
                      className="h-16 flex-col space-y-1"
                    >
                      <TrendingDown className="w-5 h-5" />
                      <span>반대</span>
                    </Button>
                    <Button
                      variant={selectedVote === "for" ? "primary" : "secondary"}
                      onClick={() => setSelectedVote("for")}
                      className="h-16 flex-col space-y-1"
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span>찬성</span>
                    </Button>
                  </div>

                  {selectedVote && (
                    <Button
                      onClick={handleVoteSubmit}
                      className="w-full"
                      variant="primary"
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      {selectedVote === "for" ? "찬성" : "반대"} 투표 제출
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already Voted */}
          {hasVoted && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2 text-cyan-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    이미 {proposal.myVote === "for" ? "찬성" : "반대"} 투표를 완료했습니다
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
