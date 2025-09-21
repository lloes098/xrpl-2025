"use client";

import { useState } from "react";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  LogOut,
  User,
  Settings,
  ChevronDown
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useWalletStore } from "@/store/walletStore";
import toast from "react-hot-toast";

export function WalletInfo() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    isConnected,
    address,
    balance,
    walletType,
    userType,
    profile,
    disconnectWallet,
    updateBalance
  } = useWalletStore();

  if (!isConnected || !address) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('주소가 클립보드에 복사되었습니다!');
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await updateBalance();
      toast.success('잔액이 업데이트되었습니다!');
    } catch (error) {
      toast.error('잔액 업데이트에 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
    toast.success('지갑 연결이 해제되었습니다.');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case 'xumm':
        return '🦘';
      case 'metamask':
        return '🦊';
      default:
        return '💼';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 h-11"
      >
        <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-xs">
          {getWalletIcon()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-white font-semibold text-sm">
            {formatAddress(address)}
          </div>
          <div className="text-gray-300 text-xs">
            {balance.xrp.toFixed(1)} XRP
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2" style={{ zIndex: 45 }}>
          <Card className="w-80">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-lg">
                    {getWalletIcon()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">
                        {walletType === 'xumm' ? 'XUMM' : 'MetaMask'}
                      </h3>
                      <Badge variant="success" className="text-xs">연결됨</Badge>
                    </div>
                    <p className="text-gray-300 text-sm">{formatAddress(address)}</p>
                  </div>
                </div>

                {/* User Type */}
                {userType && (
                  <div className="mt-3 flex items-center space-x-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <Badge variant={userType === 'creator' ? 'info' : 'success'}>
                      {userType === 'creator' ? '창작자' : '투자자'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">잔액</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">XRP</span>
                    <span className="text-white font-semibold">
                      {balance.xrp.toLocaleString()} XRP
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">RLUSD</span>
                    <span className="text-white font-semibold">
                      {balance.rlusd.toLocaleString()} RLUSD
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              {profile && (
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{profile.name || '이름 없음'}</h4>
                      {profile.bio && (
                        <p className="text-gray-300 text-sm">{profile.bio}</p>
                      )}
                    </div>
                    {profile.verified && (
                      <Badge variant="success" className="text-xs">인증됨</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="w-full justify-start"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  주소 복사
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://livenet.xrpl.org/accounts/${address}`, '_blank')}
                  className="w-full justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  XRPL 탐색기에서 보기
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  프로필 설정
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  연결 해제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 44 }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
