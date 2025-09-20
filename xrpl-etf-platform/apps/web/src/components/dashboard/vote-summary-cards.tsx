"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteSummary } from "@/lib/types";
import { formatTimeLeft, calculateVotePercentage, getVoteStatusColor } from "@/lib/utils";
import { ArrowRight, Clock, Users } from "lucide-react";

interface VoteSummaryCardsProps {
  data: VoteSummary[];
  isLoading?: boolean;
}

export default function VoteSummaryCards({ data, isLoading }: VoteSummaryCardsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>투표 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-48" />
                    <div className="h-3 bg-gray-700 rounded w-32" />
                    <div className="h-3 bg-gray-700 rounded w-24" />
                  </div>
                  <div className="w-20 h-8 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>오늘의 투표안</CardTitle>
        <Link href="/vote">
          <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
            전체 보기 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 3).map((vote, index) => {
            const { forPct, againstPct } = calculateVotePercentage(
              vote.votesFor,
              vote.votesAgainst,
              vote.totalVotes
            );
            
            return (
              <div
                key={vote.id}
                className="group p-4 bg-dark-800/30 rounded-lg border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 hover:bg-dark-800/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {vote.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{vote.summary}</p>
                  </div>
                  <Badge className={getVoteStatusColor(vote.status)}>
                    {vote.status === "active" ? "진행중" : vote.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeLeft(vote.endsAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{vote.totalVotes.toLocaleString()}표</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-dark-800 rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${forPct}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${againstPct}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">
                      찬성 {forPct.toFixed(1)}%
                    </span>
                    <span className="text-red-400">
                      반대 {againstPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-800/50">
                  <Link href={`/vote/${vote.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      투표하기 <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
