"use client";

import { useState } from "react";
import { X, Wallet, Smartphone, Chrome, Shield, Zap, Plus, Key } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";
import { useWalletStore } from "@/store/walletStore";
import toast from "react-hot-toast";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [showSeedInput, setShowSeedInput] = useState(false);
  const [seedInput, setSeedInput] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const { connectWallet, connectWithSeed, createNewWallet } = useWalletStore();

  if (!isOpen) return null;

  const handleConnect = async (walletType: 'xumm' | 'metamask' | 'xrpl') => {
    setIsConnecting(true);
    setConnectingWallet(walletType);

    try {
      const walletName = walletType === 'xumm' ? 'XUMM' : walletType === 'metamask' ? 'MetaMask' : 'XRPL';
      toast.loading(`${walletName} 지갑 연결 중...`, { id: 'wallet-connect' });
      
      await connectWallet(walletType, selectedNetwork);
      
      toast.success('지갑이 성공적으로 연결되었습니다!', { id: 'wallet-connect' });
      onClose();
    } catch (error) {
      toast.error('지갑 연결에 실패했습니다. 다시 시도해주세요.', { id: 'wallet-connect' });
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const handleConnectWithSeed = async () => {
    if (!seedInput.trim()) {
      toast.error('지갑 시드를 입력해주세요.');
      return;
    }

    setIsConnecting(true);
    setConnectingWallet('xrpl-seed');

    try {
      toast.loading('XRPL 지갑 연결 중...', { id: 'wallet-connect' });
      
      await connectWithSeed(seedInput.trim(), selectedNetwork);
      
      toast.success('지갑이 성공적으로 연결되었습니다!', { id: 'wallet-connect' });
      onClose();
    } catch (error) {
      toast.error('지갑 연결에 실패했습니다. 시드를 확인해주세요.', { id: 'wallet-connect' });
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const handleCreateNewWallet = async () => {
    setIsConnecting(true);
    setConnectingWallet('xrpl-new');

    try {
      toast.loading('새 XRPL 지갑 생성 중...', { id: 'wallet-connect' });
      
      await createNewWallet(selectedNetwork);
      
      toast.success('새 지갑이 생성되고 연결되었습니다!', { id: 'wallet-connect' });
      onClose();
    } catch (error) {
      toast.error('지갑 생성에 실패했습니다. 다시 시도해주세요.', { id: 'wallet-connect' });
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 45 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 z-10">
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
          {/* Network Selection */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">네트워크 선택</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedNetwork('testnet')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedNetwork === 'testnet'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Testnet (테스트)
              </button>
              <button
                onClick={() => setSelectedNetwork('mainnet')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedNetwork === 'mainnet'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Mainnet (실제)
              </button>
            </div>
          </div>

          {/* Create New XRPL Wallet */}
          <button
            onClick={handleCreateNewWallet}
            disabled={isConnecting}
            className="w-full glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group disabled:opacity-50"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold text-lg">새 XRPL 지갑 생성</h3>
                <p className="text-gray-300 text-sm">새로운 XRPL 지갑을 생성합니다</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs">추천</span>
                </div>
              </div>
              {isConnecting && connectingWallet === 'xrpl-new' && (
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </button>

          {/* Connect with Seed */}
          {!showSeedInput ? (
            <button
              onClick={() => setShowSeedInput(true)}
              disabled={isConnecting}
              className="w-full glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group disabled:opacity-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-semibold text-lg">기존 지갑 연결</h3>
                  <p className="text-gray-300 text-sm">지갑 시드로 연결</p>
                </div>
              </div>
            </button>
          ) : (
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">지갑 시드 입력</h3>
                <button
                  onClick={() => setShowSeedInput(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Input
                type="password"
                placeholder="지갑 시드를 입력하세요 (s로 시작)"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleConnectWithSeed}
                disabled={isConnecting || !seedInput.trim()}
                className="w-full"
              >
                {isConnecting && connectingWallet === 'xrpl-seed' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                연결
              </Button>
            </div>
          )}

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
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-xs">빠른 연결</span>
                </div>
              </div>
              {isConnecting && connectingWallet === 'xumm' && (
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
  );
}
