"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Proposal } from "@/lib/types";
import { formatPercentage, calculateVotePercentage } from "@/lib/utils";
import { 
  CheckCircle, 
  FileText, 
  Send, 
  ExternalLink, 
  Loader2,
  AlertTriangle,
  X
} from "lucide-react";

interface VoteResultBannerProps {
  proposal: Proposal;
  isVisible: boolean;
  onClose: () => void;
  onRecordOnChain: (proposalId: string) => Promise<string>;
}

export default function VoteResultBanner({ 
  proposal, 
  isVisible, 
  onClose, 
  onRecordOnChain 
}: VoteResultBannerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { forPct, againstPct } = calculateVotePercentage(
    proposal.votesFor,
    proposal.votesAgainst,
    proposal.totalVotes
  );

  const isPassed = forPct > 50;
  const resultColor = isPassed ? "text-green-400" : "text-red-400";
  const resultBg = isPassed ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20";

  const handleRecordOnChain = async () => {
    setIsRecording(true);
    setError(null);
    
    try {
      const hash = await onRecordOnChain(proposal.id);
      setTxHash(hash);
    } catch (err) {
      setError("온체인 기록 중 오류가 발생했습니다.");
    } finally {
      setIsRecording(false);
    }
  };

  const handleViewTransaction = () => {
    if (txHash) {
      // 실제로는 XRPL Explorer 링크로 이동
      window.open(`https://testnet.xrpl.org/transactions/${txHash}`, '_blank');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <Card className={`${resultBg} border-2 shadow-glow animate-slide-up`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPassed ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                <CheckCircle className={`w-6 h-6 ${resultColor}`} />
              </div>
              
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${resultColor} mb-1`}>
                  투표 집계 완료!
                </h3>
                <p className="text-white font-medium mb-2">
                  {proposal.title}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${resultColor}`}>
                      {isPassed ? "승인" : "거부"}
                    </div>
                    <div className="text-xs text-gray-400">최종 결과</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {proposal.totalVotes.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">총 투표 수</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-green-500/10 rounded">
                    <div className="text-green-400 font-bold">
                      찬성 {formatPercentage(forPct)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {proposal.votesFor.toLocaleString()}표
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-red-500/10 rounded">
                    <div className="text-red-400 font-bold">
                      반대 {formatPercentage(againstPct)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {proposal.votesAgainst.toLocaleString()}표
                    </div>
                  </div>
                </div>

                {/* Record on Chain Section */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  {!txHash ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-cyan-400">블록체인 증빙 기록</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          투표 결과를 XRPL에 메모 트랜잭션으로 영구 기록
                        </p>
                      </div>
                      <Button
                        onClick={handleRecordOnChain}
                        disabled={isRecording}
                        isLoading={isRecording}
                        variant="primary"
                        size="sm"
                        className="bg-gradient-to-r from-cyan-600 to-blue-600"
                      >
                        {isRecording ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            기록 중...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            온체인 기록하기
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-cyan-400 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            온체인 기록 완료
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                            TX: {txHash.slice(0, 20)}...{txHash.slice(-8)}
                          </p>
                        </div>
                        <Button
                          onClick={handleViewTransaction}
                          variant="ghost"
                          size="sm"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          확인
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                        <Button
                          onClick={handleRecordOnChain}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 ml-auto"
                        >
                          재시도
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Memo Transaction Preview */}
          {txHash && (
            <div className="mt-4 p-3 bg-dark-800/30 rounded-lg">
              <h5 className="text-xs font-medium text-gray-400 mb-2">기록된 메모 데이터</h5>
              <div className="font-mono text-xs text-gray-300 leading-relaxed">
                {JSON.stringify({
                  type: "vote_result",
                  proposal_id: proposal.id,
                  title: proposal.title,
                  result: isPassed ? "passed" : "rejected",
                  votes_for: proposal.votesFor,
                  votes_against: proposal.votesAgainst,
                  total_votes: proposal.totalVotes,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            ⚠️ 해커톤 데모용: 실제 XRPL 트랜잭션은 처리되지 않습니다
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
