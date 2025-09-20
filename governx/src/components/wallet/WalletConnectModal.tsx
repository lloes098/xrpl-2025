"use client";

import { useState } from "react";
import { X, Wallet, Smartphone, Chrome, Shield, Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useWalletStore } from "@/store/walletStore";
import toast from "react-hot-toast";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const { connectWallet } = useWalletStore();

  if (!isOpen) return null;

  const handleConnect = async (walletType: 'xumm' | 'metamask') => {
    setIsConnecting(true);
    setConnectingWallet(walletType);

    try {
      toast.loading(`${walletType === 'xumm' ? 'XUMM' : 'MetaMask'} 지갑 연결 중...`, { id: 'wallet-connect' });
      
      await connectWallet(walletType);
      
      toast.success('지갑이 성공적으로 연결되었습니다!', { id: 'wallet-connect' });
      onClose();
    } catch (error) {
      toast.error('지갑 연결에 실패했습니다. 다시 시도해주세요.', { id: 'wallet-connect' });
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Modal positioned on the right */}
      <div className="flex items-start justify-end min-h-screen p-4 pt-20">
        <Card className="relative w-full max-w-md z-[10000] max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center neon-glow">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">지갑 연결</CardTitle>
                <p className="text-gray-300">XRPL 지갑을 연결하여 시작하세요</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* XUMM Wallet */}
          <button
            onClick={() => handleConnect('xumm')}
            disabled={isConnecting}
            className="w-full glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold text-lg">XUMM</h3>
                <p className="text-gray-300 text-sm">모바일 XRPL 전용 지갑</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs">추천</span>
                </div>
              </div>
              {isConnecting && connectingWallet === 'xumm' && (
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </button>

          {/* MetaMask */}
          <button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="w-full glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Chrome className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold text-lg">MetaMask</h3>
                <p className="text-gray-300 text-sm">브라우저 확장 지갑</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-xs">빠른 연결</span>
                </div>
              </div>
              {isConnecting && connectingWallet === 'metamask' && (
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </button>

          {/* Info Section */}
          <div className="glass rounded-xl p-4 mt-6">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Shield className="w-5 h-5 text-cyan-400 mr-2" />
              안전한 연결
            </h4>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• 지갑 정보는 안전하게 암호화되어 저장됩니다</li>
              <li>• 개인키는 절대 서버에 전송되지 않습니다</li>
              <li>• 모든 거래는 XRPL 블록체인에 기록됩니다</li>
            </ul>
          </div>

          {/* Cancel Button */}
          <Button
            variant="secondary"
            className="w-full"
            onClick={onClose}
            disabled={isConnecting}
          >
            취소
          </Button>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
