"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Allocation } from "@/lib/types";
import { formatPercentage, getAssetColor } from "@/lib/utils";
import { 
  X, 
  Settings, 
  Pen, 
  Send, 
  CheckCircle, 
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

type RebalancingStep = "prepare" | "sign" | "send" | "confirm";

interface RebalancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAllocations: Allocation[];
  targetAllocations: Allocation[];
  onComplete: () => void;
}

export default function RebalancingModal({
  isOpen,
  onClose,
  currentAllocations,
  targetAllocations,
  onComplete
}: RebalancingModalProps) {
  const [step, setStep] = useState<RebalancingStep>("prepare");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("prepare");
      setIsProcessing(false);
      setError(null);
      setTxHash(null);
    }
  }, [isOpen]);

  const stepConfig = {
    prepare: {
      title: "리밸런싱 준비",
      subtitle: "변경 사항을 검토하고 실행을 준비합니다",
      icon: Settings,
      color: "text-blue-400",
    },
    sign: {
      title: "트랜잭션 서명",
      subtitle: "지갑에서 트랜잭션에 서명해주세요",
      icon: Pen,
      color: "text-yellow-400",
    },
    send: {
      title: "블록체인 전송",
      subtitle: "XRPL 네트워크에 트랜잭션을 전송 중입니다",
      icon: Send,
      color: "text-purple-400",
    },
    confirm: {
      title: "실행 완료",
      subtitle: "리밸런싱이 성공적으로 완료되었습니다",
      icon: CheckCircle,
      color: "text-green-400",
    },
  };

  const currentConfig = stepConfig[step];
  const Icon = currentConfig.icon;

  const handleNext = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      switch (step) {
        case "prepare":
          // 준비 단계: 간단한 지연 후 서명 단계로
          await new Promise(resolve => setTimeout(resolve, 1000));
          setStep("sign");
          break;

        case "sign":
          // 서명 단계: 지갑 서명 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 3000));
          setStep("send");
          break;

        case "send":
          // 전송 단계: 블록체인 전송 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 5000));
          const mockTxHash = `${Date.now().toString(16).toUpperCase()}ABC123`;
          setTxHash(mockTxHash);
          setStep("confirm");
          break;

        case "confirm":
          // 완료: 모달 닫기
          onComplete();
          onClose();
          break;
      }
    } catch (err) {
      setError("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep("prepare");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${currentConfig.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentConfig.title}</h3>
                <p className="text-sm text-gray-400">{currentConfig.subtitle}</p>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {(["prepare", "sign", "send", "confirm"] as RebalancingStep[]).map((stepKey, index) => {
                const isActive = step === stepKey;
                const isCompleted = ["prepare", "sign", "send", "confirm"].indexOf(step) > index;
                const StepIcon = stepConfig[stepKey].icon;

                return (
                  <div key={stepKey} className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted 
                        ? "bg-green-500 border-green-500 text-white" 
                        : isActive 
                          ? "border-cyan-500 text-cyan-400" 
                          : "border-gray-600 text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`text-xs font-medium ${
                      isActive ? "text-cyan-400" : isCompleted ? "text-green-400" : "text-gray-400"
                    }`}>
                      {stepKey === "prepare" ? "준비" :
                       stepKey === "sign" ? "서명" :
                       stepKey === "send" ? "전송" : "완료"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            {step === "prepare" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-white">변경 사항 확인</h4>
                <div className="bg-dark-800/30 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 mb-3">
                    <div>자산</div>
                    <div className="text-center">현재</div>
                    <div className="text-center">목표</div>
                    <div className="text-center">변화</div>
                  </div>
                  {currentAllocations.map((current) => {
                    const target = targetAllocations.find(t => t.asset === current.asset);
                    const change = target ? target.weightPct - current.weightPct : -current.weightPct;
                    
                    return (
                      <div key={current.asset} className="grid grid-cols-4 gap-4 text-sm py-2 border-t border-gray-700/50">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getAssetColor(current.asset) }}
                          />
                          <span className="text-white font-medium">{current.asset}</span>
                        </div>
                        <div className="text-center text-gray-300">
                          {formatPercentage(current.weightPct)}
                        </div>
                        <div className="text-center text-gray-300">
                          {target ? formatPercentage(target.weightPct) : "0%"}
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
                </div>
              </div>
            )}

            {step === "sign" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Pen className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-gray-300">
                  지갑에서 트랜잭션 서명을 요청했습니다.<br />
                  지갑 앱을 확인하고 서명해주세요.
                </p>
              </div>
            )}

            {step === "send" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
                <p className="text-gray-300">
                  XRPL 네트워크에 트랜잭션을 전송하고 있습니다.<br />
                  잠시만 기다려주세요...
                </p>
              </div>
            )}

            {step === "confirm" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-green-400 font-semibold text-lg">
                  리밸런싱이 완료되었습니다!
                </p>
                <p className="text-gray-300">
                  포트폴리오가 새로운 목표 비중으로 조정되었습니다.
                </p>
                {txHash && (
                  <div className="bg-dark-800/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">트랜잭션 해시</p>
                    <p className="font-mono text-sm text-cyan-400 break-all">{txHash}</p>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">오류 발생</span>
                </div>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {error ? (
                <>
                  <Button variant="secondary" onClick={handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </Button>
                  <Button variant="ghost" onClick={onClose} className="flex-1">
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={onClose} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleNext}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    className="flex-1"
                  >
                    {step === "confirm" ? "완료" : "다음 단계"}
                  </Button>
                </>
              )}
            </div>

            {/* Warning Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">주의사항</span>
              </div>
              <p className="text-yellow-300/80 text-xs mt-1">
                이는 해커톤용 데모입니다. 실제 블록체인 트랜잭션은 처리되지 않습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
