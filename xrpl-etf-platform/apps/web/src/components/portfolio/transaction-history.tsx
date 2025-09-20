"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/lib/types";
import { formatCurrency, truncateAddress, cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Vote, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink
} from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return ArrowDownLeft;
      case "withdraw":
        return ArrowUpRight;
      case "vote":
        return Vote;
      case "rebalance":
        return RefreshCw;
      default:
        return RefreshCw;
    }
  };

  const getTransactionLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "입금";
      case "withdraw":
        return "출금";
      case "vote":
        return "투표";
      case "rebalance":
        return "리밸런싱";
      default:
        return type;
    }
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">완료</Badge>;
      case "pending":
        return <Badge variant="warning">대기중</Badge>;
      case "failed":
        return <Badge variant="danger">실패</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return "text-green-400";
      case "withdraw":
        return "text-red-400";
      case "vote":
        return "text-blue-400";
      case "rebalance":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>거래 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-dark-800/30 rounded-lg">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/3" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-20" />
                    <div className="h-3 bg-gray-700 rounded w-16" />
                  </div>
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
      <CardHeader>
        <CardTitle>거래 내역</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">거래 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              const StatusIcon = getStatusIcon(transaction.status);
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4 p-4 bg-dark-800/30 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-colors group"
                >
                  {/* Transaction Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    transaction.type === "deposit" && "bg-green-500/20",
                    transaction.type === "withdraw" && "bg-red-500/20",
                    transaction.type === "vote" && "bg-blue-500/20",
                    transaction.type === "rebalance" && "bg-purple-500/20"
                  )}>
                    <Icon className={cn("w-5 h-5", getTransactionColor(transaction.type))} />
                  </div>

                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        {getTransactionLabel(transaction.type)}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                      <span>
                        {format(new Date(transaction.timestamp), "yyyy-MM-dd HH:mm")}
                      </span>
                      
                      {transaction.txHash && (
                        <button 
                          className="flex items-center space-x-1 hover:text-cyan-400 transition-colors"
                          onClick={() => {
                            // 실제로는 XRPL Explorer 링크로 이동
                            window.open(`https://testnet.xrpl.org/transactions/${transaction.txHash}`, '_blank');
                          }}
                        >
                          <span className="truncate max-w-20">
                            {truncateAddress(transaction.txHash, 4, 4)}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Amount and Status */}
                  <div className="text-right">
                    <div className={cn(
                      "font-semibold",
                      transaction.type === "deposit" ? "text-green-400" : 
                      transaction.type === "withdraw" ? "text-red-400" : 
                      "text-white"
                    )}>
                      {transaction.type === "deposit" && "+"}
                      {transaction.type === "withdraw" && "-"}
                      {formatCurrency(transaction.amount, transaction.asset)}
                    </div>
                    
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <StatusIcon className={cn("w-3 h-3", getStatusColor(transaction.status))} />
                      <span className={cn("text-xs", getStatusColor(transaction.status))}>
                        {transaction.status === "confirmed" ? "완료" :
                         transaction.status === "pending" ? "처리중" : "실패"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
