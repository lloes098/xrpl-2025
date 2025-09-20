"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  Shield, 
  ArrowRight,
  Target
} from "lucide-react";

// Mock data for demonstration
const mockProjects = [
  {
    id: "1",
    title: "DeFi 자산 관리 플랫폼",
    description: "XRPL 기반의 자동화된 포트폴리오 관리 툴로, 사용자가 쉽게 분산투자를 할 수 있도록 도와주는 플랫폼입니다.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    creator: "김개발자",
    category: "DeFi",
    targetAmount: 100000,
    currentAmount: 75000,
    backers: 234,
    daysLeft: 15,
    status: "active" as const,
    currency: "RLUSD" as const
  },
  {
    id: "2", 
    title: "NFT 마켓플레이스 dApp",
    description: "크리에이터를 위한 저수수료 NFT 거래 플랫폼. XRPL의 빠른 결제 시스템을 활용하여 즉시 거래가 가능합니다.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=225&fit=crop",
    creator: "박아티스트",
    category: "NFT",
    targetAmount: 50000,
    currentAmount: 52000,
    backers: 189,
    daysLeft: 0,
    status: "successful" as const,
    currency: "XRP" as const
  },
  {
    id: "3",
    title: "탈중앙화 소셜 네트워크",
    description: "사용자가 데이터를 완전히 소유하는 Web3 소셜 플랫폼. 검열 저항성과 투명성을 보장합니다.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop",
    creator: "이블록체인",
    category: "Social",
    targetAmount: 80000,
    currentAmount: 45000,
    backers: 156,
    daysLeft: 22,
    status: "active" as const,
    currency: "RLUSD" as const
  }
];

const stats = [
  { label: "총 펀딩액", value: "2.5M XRP", icon: TrendingUp },
  { label: "성공 프로젝트", value: "1,234개", icon: Target },
  { label: "활성 후원자", value: "45,678명", icon: Users },
  { label: "플랫폼 신뢰도", value: "99.9%", icon: Shield }
];

export default function Home() {
  return (
    <div className="min-h-screen gradient-dark main-content">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl float" />
          <div className="absolute top-40 right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl float" style={{animationDelay: '4s'}} />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="secondary" className="mb-8 glass border-white/30 text-white px-6 py-2 text-lg">
              ✨ XRPL 기반 탈중앙화 크라우드펀딩 플랫폼
            </Badge>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              Web3의 새로운
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent neon-text">
                크라우드펀딩
              </span>
            </h1>
            
            <p className="text-xl md:text-3xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed">
              투명하고 안전한 블록체인 기술로 혁신적인 Web3 프로젝트에 투자하고, 
              창작자와 투자자가 함께 성장하는 생태계를 만들어가세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/projects">
                <Button size="xl" variant="neon" className="shadow-2xl">
                  <Rocket className="w-6 h-6 mr-3" />
                  프로젝트 둘러보기
                </Button>
              </Link>
              <Link href="/create">
                <Button size="xl" variant="secondary" className="shadow-2xl">
                  <Users className="w-6 h-6 mr-3" />
                  프로젝트 시작하기
                </Button>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 glass rounded-2xl mb-6 group-hover:scale-105 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">{stat.value}</div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24" style={{ overflow: 'visible' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ lineHeight: '1.2', overflow: 'visible' }}>
              주목받는 프로젝트
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              혁신적인 Web3 프로젝트들을 발견하고 투자해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/projects">
              <Button size="xl" variant="secondary" className="shadow-2xl">
                모든 프로젝트 보기
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
            </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              시장 기회
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              🌐 Web3 성장의 파도, 지금이 기회<br/>
              빠르게 커지는 Web3 시장, &quot;Web3의 Wadiz&quot; 자리를 선점하세요.
            </p>
          </div>

          {/* Web2 크라우드펀딩의 한계 */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              Web2 크라우드펀딩의 한계
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group border-red-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">💸</span>
                  </div>
                  <CardTitle className="text-white text-xl">높은 수수료와 느린 정산</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    중앙화 구조가 만든 불편함, Ripplize가 바꿉니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-red-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <CardTitle className="text-white text-xl">불투명한 투자 흐름</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    보이지 않는 돈의 길, 투자 신뢰를 무너뜨립니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-red-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <CardTitle className="text-white text-xl">글로벌 확장의 벽</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    국경을 넘어서는 펀딩, Web2로는 어렵습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 개발자 문제 */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              개발자 문제
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group border-orange-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <CardTitle className="text-white text-xl">Web2 플랫폼에서는 펀딩 불가</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    블록체인 프로젝트, 갈 곳이 없습니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-orange-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">💰</span>
                  </div>
                  <CardTitle className="text-white text-xl">초기 투자 인프라 부족</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    작은 시작을 도와줄 환경이 없습니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-orange-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">📡</span>
                  </div>
                  <CardTitle className="text-white text-xl">Web3 전용 채널 부재</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    개발자와 투자자를 직접 잇는 창구가 없습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 투자자 문제 */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              투자자 문제
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group border-yellow-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">❌</span>
                  </div>
                  <CardTitle className="text-white text-xl">목표 미달 시 환불 불안</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    내 돈, 돌려받을 수 있을까?
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-yellow-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <CardTitle className="text-white text-xl">자금 관리 신뢰 부족</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    보관과 분배가 안전한지 알 수 없습니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="group border-yellow-500/20">
                <CardHeader>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">👀</span>
                  </div>
                  <CardTitle className="text-white text-xl">투명성 없는 프로젝트</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    내 돈이 어디로 쓰이는지 보이지 않습니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-purple-900/50" />
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl float" style={{animationDelay: '3s'}} />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            당신의 아이디어를 현실로 만들어보세요
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
            혁신적인 Web3 프로젝트로 세상을 바꿀 준비가 되셨나요? 
            지금 Ripplize에서 시작하세요!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/create">
              <Button size="xl" variant="neon" className="shadow-2xl">
                <Rocket className="w-6 h-6 mr-3" />
                프로젝트 시작하기
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="xl" variant="secondary" className="shadow-2xl">
                투자자로 참여하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/90 text-white py-8 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 text-sm">&copy; 2025 Ripplize. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
