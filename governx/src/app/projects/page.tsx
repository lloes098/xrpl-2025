"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  TrendingUp,
  Clock,
  DollarSign,
  Target
} from "lucide-react";

// Mock data - 더 많은 프로젝트들
const allProjects = [
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
    tags: ["DeFi", "Portfolio", "XRPL"],
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
    tags: ["NFT", "Marketplace", "Art"],
    currency: "RLUSD" as const
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
    tags: ["Social", "Privacy", "Web3"],
    currency: "XRP" as const
  },
  {
    id: "4",
    title: "AI 기반 트레이딩 봇",
    description: "머신러닝을 활용한 자동 거래 시스템으로 XRPL DEX에서 최적의 거래 기회를 찾아줍니다.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop",
    creator: "정AI연구원",
    category: "AI",
    targetAmount: 120000,
    currentAmount: 89000,
    backers: 298,
    daysLeft: 8,
    status: "active" as const,
    tags: ["AI", "Trading", "Automation"],
    currency: "RLUSD" as const
  },
  {
    id: "5",
    title: "GameFi RPG 플랫폼",
    description: "Play-to-Earn 메커니즘이 있는 블록체인 기반 RPG 게임. NFT 아이템과 토큰 보상을 제공합니다.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop",
    creator: "최게임개발",
    category: "Gaming",
    targetAmount: 200000,
    currentAmount: 156000,
    backers: 445,
    daysLeft: 12,
    status: "active" as const,
    tags: ["Gaming", "NFT", "P2E"],
    currency: "XRP" as const
  },
  {
    id: "6",
    title: "탄소 크레딧 거래소",
    description: "투명한 탄소 크레딧 거래를 위한 블록체인 플랫폼. 환경 친화적 프로젝트 지원이 목표입니다.",
    image: "https://images.unsplash.com/photo-1569163139719-de82de2efe87?w=400&h=225&fit=crop",
    creator: "환경보호단",
    category: "ESG",
    targetAmount: 90000,
    currentAmount: 67000,
    backers: 201,
    daysLeft: 18,
    status: "active" as const,
    tags: ["ESG", "Environment", "Trading"],
    currency: "RLUSD" as const
  },
  {
    id: "7",
    title: "디지털 신원 관리 시스템",
    description: "자기주권적 신원(SSI) 관리 플랫폼으로 개인 데이터의 완전한 통제권을 제공합니다.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
    creator: "김보안전문가",
    category: "Identity",
    targetAmount: 150000,
    currentAmount: 45000,
    backers: 123,
    daysLeft: 25,
    status: "active" as const,
    tags: ["Identity", "Security", "Privacy"],
    currency: "XRP" as const
  },
  {
    id: "8",
    title: "크로스체인 브릿지",
    description: "XRPL과 다른 블록체인 간의 자산 이동을 원활하게 해주는 인터체인 브릿지 프로토콜입니다.",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=225&fit=crop",
    creator: "브릿지팀",
    category: "Infrastructure",
    targetAmount: 180000,
    currentAmount: 92000,
    backers: 267,
    daysLeft: 5,
    status: "active" as const,
    tags: ["Bridge", "Interchain", "Protocol"],
    currency: "RLUSD" as const
  },
  {
    id: "9",
    title: "실패한 프로젝트 예시",
    description: "목표 금액을 달성하지 못한 프로젝트입니다.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    creator: "실패팀",
    category: "DeFi",
    targetAmount: 100000,
    currentAmount: 25000,
    backers: 45,
    daysLeft: 0,
    status: "failed" as const,
    tags: ["Failed", "Example"],
    currency: "XRP" as const
  }
];

const categories = ["All", "DeFi", "NFT", "Gaming", "AI", "Social", "ESG", "Identity", "Infrastructure"];
const statusOptions = ["All", "Active", "Successful", "Failed"];
const currencyOptions = ["All", "XRP", "RLUSD"];
const sortOptions = [
  { label: "최신순", value: "newest" },
  { label: "인기순", value: "popular" },
  { label: "마감임박", value: "ending" },
  { label: "펀딩액순", value: "funded" }
];

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCurrency, setSelectedCurrency] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // 사용자가 생성한 프로젝트와 기본 프로젝트 합치기
  const getUserProjects = () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('userProjects') || '[]');
    }
    return [];
  };

  const allProjectsWithUser = [...allProjects, ...getUserProjects()];

  // 프로젝트 삭제 함수
  const handleDeleteProject = (projectId: string) => {
    if (typeof window !== 'undefined') {
      const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      const updatedProjects = userProjects.filter((p: { id: string }) => p.id !== projectId);
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      
      // 페이지 새로고침으로 목록 업데이트
      window.location.reload();
    }
  };

  // 프로젝트가 사용자가 생성한 것인지 확인
  const isUserProject = (projectId: string) => {
    if (typeof window !== 'undefined') {
      const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      return userProjects.some((p: { id: string }) => p.id === projectId);
    }
    return false;
  };

  // Filter and sort projects
  const filteredProjects = allProjectsWithUser
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || 
                          (selectedStatus === "Active" && project.status === "active") ||
                          (selectedStatus === "Successful" && project.status === "successful") ||
                          (selectedStatus === "Failed" && project.status === "failed");
      const matchesCurrency = selectedCurrency === "All" || project.currency === selectedCurrency;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesCurrency;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.backers - a.backers;
        case "ending":
          return a.daysLeft - b.daysLeft;
        case "funded":
          return b.currentAmount - a.currentAmount;
        default:
          return parseInt(b.id) - parseInt(a.id);
      }
    });

  const stats = [
    { label: "전체 프로젝트", value: allProjects.length.toString(), icon: Target },
    { label: "진행 중", value: allProjects.filter(p => p.status === "active").length.toString(), icon: Clock },
    { label: "성공", value: allProjects.filter(p => p.status === "successful").length.toString(), icon: TrendingUp },
    { label: "총 펀딩액", value: `${(allProjects.reduce((sum, p) => sum + p.currentAmount, 0) / 1000).toFixed(0)}K`, icon: DollarSign }
  ];

  return (
    <div className="min-h-screen gradient-dark main-content">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            모든 프로젝트
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            혁신적인 Web3 프로젝트들을 발견하고 투자하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="h-28"> {/* 고정 높이 */}
            <CardContent className="p-0 h-full grid place-items-center"> {/* 완전 중앙 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
          
                {/* 시각적 중심 보정: 행간 제거 */}
                <div className="text-3xl font-bold text-white leading-none">{stat.value}</div>
                <div className="text-gray-400 text-base leading-none">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
          
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 glass rounded-2xl text-white placeholder-gray-400 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              필터
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 pr-8 glass rounded-xl text-white bg-transparent border border-white/10 focus:border-purple-500/50 focus:outline-none appearance-none cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="text-gray-400 text-sm ml-auto">
              {filteredProjects.length}개 프로젝트
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "success" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">상태</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <Badge
                      key={status}
                      variant={selectedStatus === status ? "success" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedStatus(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">통화</label>
                <div className="flex flex-wrap gap-2">
                  {currencyOptions.map(currency => (
                    <Badge
                      key={currency}
                      variant={selectedCurrency === currency ? "success" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedCurrency(currency)}
                    >
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length > 0 ? (
          <div className={`grid gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={handleDeleteProject}
                isUserProject={isUserProject(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">검색 결과가 없습니다</h3>
            <p className="text-gray-400 mb-8">다른 검색어나 필터를 시도해보세요</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedStatus("All");
                setSelectedCurrency("All");
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
