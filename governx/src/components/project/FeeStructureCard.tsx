import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Calculator, CreditCard, TrendingUp, Shield, Zap } from "lucide-react";

interface FeeStructureProps {
  targetAmount: number;
  estimatedAmount?: number;
  currency?: "XRP" | "RLUSD";
}

export function FeeStructureCard({ targetAmount, estimatedAmount = targetAmount, currency = "RLUSD" }: FeeStructureProps) {
  const paymentFeeRate = 0.01; // 1%
  const successFeeRate = 0.10; // 10%
  
  const paymentFee = estimatedAmount * paymentFeeRate;
  const successFee = estimatedAmount * successFeeRate;
  const totalPlatformFee = paymentFee + successFee;
  const creatorReceives = estimatedAmount - totalPlatformFee;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center neon-glow">
            <Calculator className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">수수료 구조</CardTitle>
            <p className="text-gray-300">투명한 Web3 기반 수수료 시스템</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Fee Structure Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-white font-semibold">결제 수수료</h4>
                <p className="text-gray-300 text-sm">백커 펀딩시 실시간 차감</p>
              </div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">요율</span>
                <Badge variant="info">{(paymentFeeRate * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-300">예상 수수료</span>
                <span className="text-white font-semibold">{paymentFee.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-white font-semibold">성공 수수료</h4>
                <p className="text-gray-300 text-sm">목표 달성시 자동 정산</p>
              </div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">요율</span>
                <Badge variant="success">{(successFeeRate * 100).toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-300">예상 수수료</span>
                <span className="text-white font-semibold">{successFee.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Calculation Summary */}
        <div className="glass rounded-xl p-6 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-400/30">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            수수료 시뮬레이션
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">목표 금액</span>
              <span className="text-white font-semibold">{targetAmount.toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">예상 모금액</span>
              <span className="text-cyan-400 font-semibold">{estimatedAmount.toLocaleString()} {currency}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>결제 수수료 (1%)</span>
                <span>-{paymentFee.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                <span>성공 수수료 (10%)</span>
                <span>-{successFee.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                <span>총 플랫폼 수수료</span>
                <span>-{totalPlatformFee.toLocaleString()} {currency}</span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between items-center text-xl">
                <span className="text-white font-semibold">창작자 수령액</span>
                <span className="text-emerald-400 font-bold neon-text">{creatorReceives.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Web3 Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-lg p-4 text-center">
            <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h5 className="text-white font-semibold text-sm">자동 정산</h5>
            <p className="text-gray-400 text-xs">스마트컨트랙트 기반</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h5 className="text-white font-semibold text-sm">투명한 수수료</h5>
            <p className="text-gray-400 text-xs">블록체인에 기록</p>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h5 className="text-white font-semibold text-sm">즉시 송금</h5>
            <p className="text-gray-400 text-xs">목표 달성시 자동</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
