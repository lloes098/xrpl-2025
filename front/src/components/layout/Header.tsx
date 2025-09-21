"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { WalletConnectModal } from "../wallet/WalletConnectModal";
import { WalletInfo } from "../wallet/WalletInfo";
import { useWalletStore } from "@/store/walletStore";
import { Wallet, Menu, X, Rocket, Users, BarChart3 } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected } = useWalletStore();

  return (
    <header className="sticky top-0 w-full glass border-b border-white/10" style={{ zIndex: 40 }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 min-h-[64px]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 rounded-xl neon-glow group-hover:scale-110 transition-transform duration-300">
              <Rocket className="w-6 h-6 text-white" />
            </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent neon-text">
          Ripplize
        </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/projects" 
              className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 hover:scale-105 group"
            >
              <Rocket className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
              <span className="font-medium">프로젝트</span>
            </Link>
            <Link 
              href="/create" 
              className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 hover:scale-105 group"
            >
              <Users className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
              <span className="font-medium">프로젝트 생성</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2 hover:scale-105 group"
            >
              <BarChart3 className="w-4 h-4 group-hover:text-pink-400 transition-colors" />
              <span className="font-medium">대시보드</span>
            </Link>
          </nav>

          {/* Wallet Connection & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="hidden sm:block">
                <WalletInfo />
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsWalletModalOpen(true)}
                className="hidden sm:flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>지갑 연결</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/projects" 
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Rocket className="w-4 h-4" />
                <span>프로젝트</span>
              </Link>
              <Link 
                href="/create" 
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                <span>프로젝트 생성</span>
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>대시보드</span>
              </Link>
              {isConnected ? (
                <div className="w-full">
                  <WalletInfo />
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsWalletModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full"
                >
                  <Wallet className="w-4 h-4" />
                  <span>지갑 연결</span>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </header>
  );
}
