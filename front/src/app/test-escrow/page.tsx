"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createMPTEscrow, finishEscrow, cancelEscrow, getEscrowInfo } from "@/lib/api/escrow";
import toast from "react-hot-toast";

export default function TestEscrowPage() {
  const [issuanceId, setIssuanceId] = useState("0060CCCBAC66353D2C0CB91858C578A16979C5B7983107DA");
  const [value, setValue] = useState("100");
  const [destination, setDestination] = useState("rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH");
  const [finishAfter, setFinishAfter] = useState(60); // 1분
  const [cancelAfter, setCancelAfter] = useState(300); // 5분
  const [escrowSequence, setEscrowSequence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 테스트용 지갑 시드들
  const adminSeed = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
  const userSeed = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";
  const user2Seed = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";

  const handleCreateEscrow = async () => {
    setIsLoading(true);
    try {
      const result = await createMPTEscrow({
        issuanceId,
        value,
        destination,
        finishAfter,
        cancelAfter,
        adminSeed,
        userSeed,
        user2Seed
      });

      if (result.success && result.data) {
        setEscrowSequence(result.data.sequence);
        toast.success(`에스크로 생성 성공! Sequence: ${result.data.sequence}`);
      } else {
        toast.error(`에스크로 생성 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error(`에스크로 생성 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishEscrow = async () => {
    if (!escrowSequence) {
      toast.error("에스크로 Sequence가 필요합니다");
      return;
    }

    setIsLoading(true);
    try {
      const result = await finishEscrow({
        ownerAddress: destination, // 실제로는 에스크로 소유자 주소
        offerSequence: escrowSequence,
        adminSeed,
        userSeed,
        user2Seed
      });

      if (result.success) {
        toast.success("에스크로 해제 성공!");
      } else {
        toast.error(`에스크로 해제 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error(`에스크로 해제 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEscrow = async () => {
    if (!escrowSequence) {
      toast.error("에스크로 Sequence가 필요합니다");
      return;
    }

    setIsLoading(true);
    try {
      const result = await cancelEscrow({
        ownerAddress: destination, // 실제로는 에스크로 소유자 주소
        offerSequence: escrowSequence,
        adminSeed,
        userSeed,
        user2Seed
      });

      if (result.success) {
        toast.success("에스크로 취소 성공!");
      } else {
        toast.error(`에스크로 취소 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error(`에스크로 취소 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetEscrowInfo = async () => {
    if (!escrowSequence) {
      toast.error("에스크로 Sequence가 필요합니다");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getEscrowInfo({
        ownerAddress: destination,
        offerSequence: escrowSequence,
        adminSeed,
        userSeed,
        user2Seed
      });

      if (result.success) {
        toast.success("에스크로 정보 조회 성공!");
        console.log("에스크로 정보:", result.data);
      } else {
        toast.error(`에스크로 정보 조회 실패: ${result.error}`);
      }
    } catch (error) {
      toast.error(`에스크로 정보 조회 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Token Escrow 테스트</h1>
          <p className="text-gray-400">MPT 토큰 에스크로 기능을 테스트해보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 에스크로 생성 */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">MPT 에스크로 생성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  MPT Issuance ID
                </label>
                <Input
                  value={issuanceId}
                  onChange={(e) => setIssuanceId(e.target.value)}
                  placeholder="MPT Issuance ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  에스크로할 수량
                </label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  목적지 주소
                </label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    해제 가능 시간 (초)
                  </label>
                  <Input
                    type="number"
                    value={finishAfter}
                    onChange={(e) => setFinishAfter(parseInt(e.target.value))}
                    placeholder="60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    취소 가능 시간 (초)
                  </label>
                  <Input
                    type="number"
                    value={cancelAfter}
                    onChange={(e) => setCancelAfter(parseInt(e.target.value))}
                    placeholder="300"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleCreateEscrow}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "생성 중..." : "에스크로 생성"}
              </Button>
            </CardContent>
          </Card>

          {/* 에스크로 관리 */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">에스크로 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {escrowSequence && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">
                    에스크로 Sequence: <span className="font-mono">{escrowSequence}</span>
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  onClick={handleFinishEscrow}
                  disabled={isLoading || !escrowSequence}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "처리 중..." : "에스크로 해제"}
                </Button>
                
                <Button
                  onClick={handleCancelEscrow}
                  disabled={isLoading || !escrowSequence}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "처리 중..." : "에스크로 취소"}
                </Button>
                
                <Button
                  onClick={handleGetEscrowInfo}
                  disabled={isLoading || !escrowSequence}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "조회 중..." : "에스크로 정보 조회"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사용법 안내 */}
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle className="text-white">사용법 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-2">
              <p>1. <strong>MPT Issuance ID</strong>: 프로젝트 생성 시 받은 MPT 토큰 ID를 입력하세요</p>
              <p>2. <strong>에스크로할 수량</strong>: 에스크로할 MPT 토큰 수량을 입력하세요</p>
              <p>3. <strong>목적지 주소</strong>: 에스크로된 토큰을 받을 주소를 입력하세요</p>
              <p>4. <strong>해제 가능 시간</strong>: 에스크로 해제가 가능한 시간(초)을 설정하세요</p>
              <p>5. <strong>취소 가능 시간</strong>: 에스크로 취소가 가능한 시간(초)을 설정하세요</p>
              <p className="text-yellow-400 mt-4">
                <strong>주의:</strong> 현재는 테스트용으로 모든 지갑이 동일한 시드를 사용합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
