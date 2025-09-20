"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/wallet-store";
import { useAppStore } from "@/stores/app-store";
import { cn, truncateAddress } from "@/lib/utils";
import {
  LayoutDashboard,
  Vote,
  Wallet,
  Users,
  Settings,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/vote", label: "투표", icon: Vote },
  { href: "/portfolio", label: "포트폴리오", icon: Wallet },
  { href: "/managers", label: "매니저", icon: Users },
  { href: "/settings", label: "설정", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, address, connect, disconnect, network } = useWalletStore();
  const { addToast } = useAppStore();

  const handleWalletConnect = () => {
    if (isConnected) {
      disconnect();
      addToast({
        message: "지갑 연결이 해제되었습니다",
        type: "info",
      });
    } else {
      // 실제 지갑 연결 로직은 여기에 구현
      const mockAddress = "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      connect(mockAddress);
      addToast({
        message: "지갑이 연결되었습니다",
        type: "success",
      });
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-black/90 backdrop-blur-md border-r border-gray-800/50 flex-col z-50">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">XRPL ETF</h1>
              <p className="text-xs text-gray-400">Platform</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-400 hover:text-gray-200 hover:bg-primary-500/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">네트워크</span>
              <Badge variant="info">{network}</Badge>
            </div>
            
            {isConnected && address && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">연결된 지갑</div>
                <div className="bg-dark-800/50 rounded-lg p-2">
                  <div className="text-sm font-mono text-primary-400">
                    {truncateAddress(address)}
                  </div>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleWalletConnect}
              variant={isConnected ? "secondary" : "primary"}
              className="w-full"
            >
              {isConnected ? "연결 해제" : "지갑 연결"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-gray-800/50 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">XRPL ETF</h1>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu */}
        <div className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-black/90 backdrop-blur-md border-l border-gray-800/50 transform transition-transform duration-300 z-50",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">메뉴</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300",
                        isActive
                          ? "bg-gradient-primary text-white shadow-glow"
                          : "text-gray-400 hover:text-gray-200 hover:bg-primary-500/10"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">네트워크</span>
                  <Badge variant="info">{network}</Badge>
                </div>
                
                {isConnected && address && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">연결된 지갑</div>
                    <div className="bg-dark-800/50 rounded-lg p-2">
                      <div className="text-sm font-mono text-primary-400">
                        {truncateAddress(address)}
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleWalletConnect}
                  variant={isConnected ? "secondary" : "primary"}
                  className="w-full"
                >
                  {isConnected ? "연결 해제" : "지갑 연결"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
