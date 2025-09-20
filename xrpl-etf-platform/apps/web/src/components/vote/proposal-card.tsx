"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Proposal } from "@/lib/types";
import { 
  formatTimeLeft, 
  calculateVotePercentage, 
  getVoteStatusColor,
  getAssetColor 
} from "@/lib/utils";
import { Clock, User, TrendingUp, TrendingDown, Vote } from "lucide-react";

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: string, vote: "for" | "against") => void;
  onViewDetails: (proposalId: string) => void;
}

export default function ProposalCard({ proposal, onVote, onViewDetails }: ProposalCardProps) {
  const { forPct, againstPct } = calculateVotePercentage(
    proposal.votesFor,
    proposal.votesAgainst,
    proposal.totalVotes
  );

  const isActive = proposal.status === "active";
  const hasVoted = proposal.myVote !== undefined;

  // Calculate main change summary
  const getChangeSummary = () => {
    if (proposal.changes.length === 0) return "변경 사항 없음";
    
    const mainChange = proposal.changes.reduce((prev, current) => {
      return prev.weightPct > current.weightPct ? prev : current;
    });
    
    return `${mainChange.asset} ${mainChange.weightPct}%`;
  };

  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 hover:shadow-glow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {proposal.title}
              </h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{proposal.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeLeft(proposal.endsAt)}</span>
                </div>
              </div>
            </div>
            <Badge className={getVoteStatusColor(proposal.status)}>
              {proposal.status === "active" ? "진행중" : 
               proposal.status === "passed" ? "승인됨" :
               proposal.status === "rejected" ? "거부됨" : "만료됨"}
            </Badge>
          </div>

          {/* Change Summary */}
          <div className="bg-dark-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">주요 변경사항</h4>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">{getChangeSummary()}</span>
            </div>
            
            {/* Asset allocation changes */}
            <div className="mt-3 space-y-2">
              {proposal.changes.slice(0, 3).map((change, index) => (
                <div key={change.asset} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getAssetColor(change.asset) }}
                    />
                    <span className="text-gray-300">{change.asset}</span>
                  </div>
                  <span className="text-white font-medium">{change.weightPct}%</span>
                </div>
              ))}
              {proposal.changes.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{proposal.changes.length - 3}개 더...
                </div>
              )}
            </div>
          </div>

          {/* Vote Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">투표 현황</span>
              <span className="text-gray-300">
                {proposal.totalVotes.toLocaleString()}표 참여
              </span>
            </div>
            
            <div className="w-full bg-dark-800 rounded-full h-3">
              <div className="flex h-3 rounded-full overflow-hidden">
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
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400">
                  찬성 {forPct.toFixed(1)}% ({proposal.votesFor.toLocaleString()})
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400">
                  반대 {againstPct.toFixed(1)}% ({proposal.votesAgainst.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-800/50">
            <Button
              variant="ghost"
              onClick={() => onViewDetails(proposal.id)}
              className="flex-1"
            >
              상세보기
            </Button>
            
            {isActive && !hasVoted && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onVote(proposal.id, "against")}
                  className="px-4 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                >
                  반대
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onVote(proposal.id, "for")}
                  className="px-4"
                >
                  찬성
                </Button>
              </>
            )}
            
            {hasVoted && (
              <div className="flex items-center space-x-2 text-sm">
                <Vote className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400">
                  {proposal.myVote === "for" ? "찬성" : "반대"} 투표함
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
