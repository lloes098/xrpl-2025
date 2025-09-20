"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/wallet-store";
import { useAppStore } from "@/stores/app-store";
import { NetworkType } from "@/lib/types";
import { truncateAddress, cn } from "@/lib/utils";
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  Globe, 
  Code, 
  Database,
  Wallet,
  Shield,
  Monitor,
  Moon,
  Sun,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const { 
    isConnected, 
    address, 
    network, 
    balance, 
    connect, 
    disconnect, 
    setNetwork 
  } = useWalletStore();
  
  const { 
    developerMode, 
    mockDataEnabled, 
    toggleDeveloperMode, 
    toggleMockData,
    addToast 
  } = useAppStore();

  const networks: { value: NetworkType; label: string; description: string }[] = [
    { value: "mainnet", label: "Mainnet", description: "XRPL 메인넷" },
    { value: "testnet", label: "Testnet", description: "XRPL 테스트넷" },
    { value: "devnet", label: "Devnet", description: "XRPL 개발넷" },
  ];

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    addToast({
      message: `네트워크가 ${networks.find(n => n.value === newNetwork)?.label}로 변경되었습니다`,
      type: "info",
    });
  };

  const handleWalletConnect = () => {
    if (isConnected) {
      disconnect();
      addToast({
        message: "지갑 연결이 해제되었습니다",
        type: "info",
      });
    } else {
      // 실제 지갑 연결 로직
      const mockAddress = "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      connect(mockAddress);
      addToast({
        message: "지갑이 연결되었습니다",
        type: "success",
      });
    }
  };

  const handleResetSettings = () => {
    // 설정 초기화 로직
    addToast({
      message: "설정이 초기화되었습니다",
      type: "info",
    });
  };

  const handleClearCache = () => {
    // 캐시 클리어 로직
    addToast({
      message: "캐시가 클리어되었습니다",
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">설정</h1>
            <p className="text-gray-400 mt-1">플랫폼 설정을 관리하세요</p>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Wallet Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-cyan-400" />
              <span>지갑 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <div className="font-medium text-white">
                    {isConnected ? "지갑 연결됨" : "지갑 연결 안됨"}
                  </div>
                  {isConnected && address && (
                    <div className="text-sm text-gray-400 font-mono">
                      {truncateAddress(address)}
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleWalletConnect}
                variant={isConnected ? "secondary" : "primary"}
              >
                {isConnected ? "연결 해제" : "지갑 연결"}
              </Button>
            </div>

            {/* Wallet Balance */}
            {isConnected && (
              <div className="p-4 bg-dark-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">지갑 잔고</div>
                    <div className="text-xl font-bold text-white">
                      {balance.toLocaleString()} XRP
                    </div>
                  </div>
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>네트워크 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                사용할 XRPL 네트워크를 선택하세요
              </div>
              <div className="grid grid-cols-1 gap-3">
                {networks.map((net) => (
                  <div
                    key={net.value}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                      network === net.value
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-gray-700 bg-dark-800/30 hover:border-gray-600"
                    )}
                    onClick={() => handleNetworkChange(net.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{net.label}</div>
                        <div className="text-sm text-gray-400">{net.description}</div>
                      </div>
                      {network === net.value && (
                        <CheckCircle className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Info className="w-4 h-4" />
                <span>현재 선택된 네트워크: </span>
                <Badge variant="info">{networks.find(n => n.value === network)?.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-cyan-400" />
              <span>개발자 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Developer Mode */}
            <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium text-white">개발자 모드</div>
                  <div className="text-sm text-gray-400">
                    디버그 정보 및 개발 도구 표시
                  </div>
                </div>
              </div>
              <button
                onClick={toggleDeveloperMode}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  developerMode ? "bg-cyan-500" : "bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    developerMode ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Mock Data */}
            <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium text-white">Mock 데이터 사용</div>
                  <div className="text-sm text-gray-400">
                    실제 블록체인 대신 모의 데이터 사용
                  </div>
                </div>
              </div>
              <button
                onClick={toggleMockData}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  mockDataEnabled ? "bg-green-500" : "bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    mockDataEnabled ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Developer Status */}
            {developerMode && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-400">개발자 모드 활성화됨</span>
                </div>
                <div className="text-sm text-purple-300">
                  추가 디버그 정보가 표시되며, 개발자 도구에 접근할 수 있습니다.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-cyan-400" />
              <span>시스템 설정</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="secondary"
                onClick={handleClearCache}
                className="h-16 flex-col space-y-1"
              >
                <Database className="w-5 h-5" />
                <span>캐시 클리어</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleResetSettings}
                className="h-16 flex-col space-y-1 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
              >
                <Settings className="w-5 h-5" />
                <span>설정 초기화</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <span>애플리케이션 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400">버전</div>
                  <div className="font-medium text-white">v1.0.0-beta</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">빌드</div>
                  <div className="font-medium text-white">2024.01.15</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">플랫폼</div>
                  <div className="font-medium text-white">XRPL Ledger</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">라이센스</div>
                  <div className="font-medium text-white">MIT License</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-800/50">
                <div className="text-sm text-gray-400">
                  이 애플리케이션은 XRPL 해커톤을 위해 개발된 프로토타입입니다.
                  실제 자금을 사용하지 마세요.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Notice */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">해커톤 프로토타입 안내</h4>
                <p className="text-yellow-300/80 text-sm">
                  현재 버전은 해커톤을 위한 프로토타입으로, 실제 블록체인 트랜잭션은 처리되지 않습니다. 
                  모든 데이터는 모의 데이터이며, 실제 자금을 사용하지 마세요. 
                  프로덕션 환경에서는 추가적인 보안 검증과 테스트가 필요합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
