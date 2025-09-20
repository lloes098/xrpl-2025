"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowDownLeft, ArrowUpRight, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TransactionModalProps {
  type: "deposit" | "withdraw";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, asset?: string) => void;
  maxAmount?: number;
  currentPrice?: number;
}

export default function TransactionModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  maxAmount = 0,
  currentPrice = 20.15
}: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("RLUSD"); // 기본값 RLUSD
  const [isLoading, setIsLoading] = useState(false);

  const isDeposit = type === "deposit";
  const parsedAmount = parseFloat(amount) || 0;
  const estimatedETFX = isDeposit ? parsedAmount / currentPrice : 0;
  const estimatedXRP = !isDeposit ? parsedAmount * currentPrice : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    if (!isDeposit && parsedAmount > maxAmount) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 트랜잭션 시뮬레이션
      onSubmit(parsedAmount, selectedAsset);
      setAmount("");
      setSelectedAsset("RLUSD"); // 리셋
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = isDeposit 
    ? [1000, 5000, 10000, 25000]
    : [0.25, 0.5, 0.75, 1.0].map(ratio => maxAmount * ratio);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center space-x-2">
              {isDeposit ? (
                <ArrowDownLeft className="w-5 h-5 text-green-400" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-red-400" />
              )}
              <span>{isDeposit ? "자산 입금" : "ETFX 환매"}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Asset Selection (Only for Deposit) */}
              {isDeposit && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    입금할 자산 선택
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset("RLUSD")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedAsset === "RLUSD"
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-700 bg-dark-800/30 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">RLUSD</div>
                        <div className="text-xs text-gray-400 mt-1">Stablecoin (권장)</div>
                        <div className="text-xs text-green-400 mt-1">안정성 ↑</div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedAsset("XRP")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedAsset === "XRP"
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-700 bg-dark-800/30 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">XRP</div>
                        <div className="text-xs text-gray-400 mt-1">Native Token</div>
                        <div className="text-xs text-yellow-400 mt-1">변동성 주의</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isDeposit ? `입금할 ${selectedAsset} 수량` : "환매할 ETFX 수량"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={!isDeposit ? maxAmount : undefined}
                    className="w-full bg-dark-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    {isDeposit ? selectedAsset : "ETFX"}
                  </div>
                </div>
                {!isDeposit && (
                  <div className="text-xs text-gray-400 mt-1">
                    최대: {formatCurrency(maxAmount, "ETFX")}
                  </div>
                )}
              </div>

              {/* Preset Amounts */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  빠른 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetAmounts.map((preset, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      className="text-xs"
                    >
                      {isDeposit ? formatCurrency(preset, selectedAsset) : 
                       index === 3 ? "전액" : `${((index + 1) * 25)}%`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Calculation Preview */}
              {parsedAmount > 0 && (
                <Card className="bg-dark-800/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calculator className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-400">예상 결과</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">현재 ETFX 가격</span>
                        <span className="text-white">{formatCurrency(currentPrice)}</span>
                      </div>
                      
                      {isDeposit ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">입금 {selectedAsset}</span>
                            <span className="text-white">{formatCurrency(parsedAmount, selectedAsset)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-700/50 pt-2">
                            <span className="text-cyan-400 font-medium">받을 ETFX</span>
                            <span className="text-cyan-400 font-medium">
                              {formatCurrency(estimatedETFX, "ETFX")}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">환매 ETFX</span>
                            <span className="text-white">{formatCurrency(parsedAmount, "ETFX")}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-700/50 pt-2">
                            <span className="text-cyan-400 font-medium">받을 XRP</span>
                            <span className="text-cyan-400 font-medium">
                              {formatCurrency(estimatedXRP)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={parsedAmount <= 0 || (!isDeposit && parsedAmount > maxAmount) || isLoading}
                isLoading={isLoading}
              >
                {isLoading 
                  ? "처리 중..." 
                  : isDeposit 
                    ? `${selectedAsset} 입금하기` 
                    : "ETFX 환매하기"
                }
              </Button>

              {/* Warning */}
              <div className="text-xs text-gray-400 text-center">
                {isDeposit 
                  ? `입금된 ${selectedAsset}는 ETFX 토큰으로 교환되며, 실시간 가격이 적용됩니다.`
                  : "환매된 ETFX는 XRP로 교환되며, 처리까지 시간이 소요될 수 있습니다."
                }
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}