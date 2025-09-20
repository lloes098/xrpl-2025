"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Gift,
  ShoppingBag,
  Handshake,
  Bell,
  Star,
  Globe,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Clock,
  Heart,
  ArrowRight,
  Plus,
  Settings
} from "lucide-react";

// Mock data
const mockUserData = {
  user: {
    name: "김투자자",
    userId: "596",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    points: 1250,
    coupons: 7
  },
  stats: [
    { label: "펀딩+", value: "0", icon: Gift, color: "text-blue-400" },
    { label: "스토어", value: "0", icon: ShoppingBag, color: "text-purple-400" },
    { label: "지지서명", value: "보기", icon: Handshake, color: "text-green-400", action: true },
    { label: "알림신청", value: "보기", icon: Bell, color: "text-yellow-400", action: true }
  ],
  recommendations: [
    {
      id: "1",
      title: "메이커 추천하기",
      description: "메이커 추천하면 최대 50,000포인트",
      icon: Plus,
      color: "bg-green-500",
      iconColor: "text-white"
    },
    {
      id: "2", 
      title: "글로벌 서비스 오픈",
      description: "친구와 함께 5,000P 혜택 받기!",
      icon: Globe,
      color: "bg-blue-500",
      iconColor: "text-white"
    }
  ],
  recentProjects: [
    {
      id: "1",
      title: "아기궁둥이 퍼프로 모 든 파데 착붙, 쫙-밀착, 코끼...",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop",
      achievement: "49,835%",
      category: "뷰티",
      hasCoupon: true,
      backers: 1234
    },
    {
      id: "2",
      title: "유튜버 극찬! LDAC 고음질+노 캔, 30만원 대 이어폰이 6만...",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
      achievement: "4,371%",
      category: "테크",
      hasCoupon: true,
      backers: 567
    }
  ],
  ads: [
    {
      id: "1",
      title: "25만 인플루언서 교근관리 노하우 싹 풉니다",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop",
      type: "AD"
    },
    {
      id: "2",
      title: "혹시 나도 ADHD? 게임으로 집중력 학습!",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop",
      type: "AD"
    }
  ]
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, stats, recommendations, recentProjects, ads } = mockUserData;

  return (
    <div className="min-h-screen gradient-dark main-content">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">온라인</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            익명의 서포터 {user.userId}님
            <span className="block text-2xl md:text-3xl text-gray-300 font-normal mt-2">
              안녕하세요! 👋
            </span>
          </h1>
          <Button variant="secondary" size="lg" className="gap-3 px-8 py-4 text-lg">
            <Users className="w-5 h-5" />
            서포터클럽 3개월 무료 혜택 받기
          </Button>
        </div>



        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                최근 본 프로젝트
              </h2>
              <p className="text-gray-400">익명의 서포터 {user.userId}님이 관심을 가진 프로젝트들</p>
            </div>
            <Button variant="ghost" className="text-gray-400 hover:text-white group">
              전체보기
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentProjects.map((project) => (
              <Card key={project.id} className="group overflow-hidden hover:scale-105 transition-all duration-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {project.achievement} 달성
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 bg-gray-900/50">
                  <div className="flex items-center gap-2 mb-4 pt-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      쿠폰 혜택
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-sm">진행중</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {project.category}
                    </span>
                    <span className="text-gray-300">
                      {project.backers}명 투자
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ads Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ads.map((ad) => (
            <Card key={ad.id} className="group overflow-hidden hover:scale-105 transition-all duration-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              {ad.image ? (
                <div className="relative overflow-hidden h-48">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-gray-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                      {ad.type}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="absolute top-4 right-4">
                    <div className="bg-gray-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                      {ad.type}
                    </div>
                  </div>
                </div>
              )}
              
              <CardContent className="p-6 bg-gray-900/50 flex items-center justify-center min-h-[120px]">
                <h3 className="text-lg font-bold text-white text-center group-hover:text-cyan-400 transition-colors">
                  {ad.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
