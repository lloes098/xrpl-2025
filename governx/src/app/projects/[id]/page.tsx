"use client";

import React, { useState } from "react";

export const dynamic = "force-dynamic";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import OverviewTab from "../../../components/project/OverviewTab";
import { TransparencyChart } from "../../../components/project/TransparencyChart";
import { useWalletStore } from "@/store/walletStore";
import { sendXRPPayment, sendIOUToken, sendIOUPayment, setupTrustline, checkTrustline, createProjectEscrow, releaseProjectFunds, refundProjectFunds } from "@/lib/xrpl";
import { 
  ArrowLeft,
  Heart,
  Share2,
  DollarSign,
  Target,
  Calendar,
  User,
  MapPin,
  TrendingUp,
  Shield,
  Star,
  Coins,
  Vote,
  FileText,
  BarChart3,
  Wallet,
  CheckCircle,
  X,
  Trash2,
  RefreshCw,
  Send,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

// Mock project data - 실제로는 API에서 가져올 것
const getProjectById = (id: string) => {
  // 먼저 allProjects에서 업데이트된 프로젝트 확인
  if (typeof window !== 'undefined') {
    const allProjects = JSON.parse(localStorage.getItem('allProjects') || '[]');
    const updatedProject = allProjects.find((p: { id: string }) => p.id === id);
    if (updatedProject) {
      return updatedProject;
    }
    
    // 그 다음 userProjects에서 확인
    const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
    const userProject = userProjects.find((p: { id: string }) => p.id === id);
    if (userProject) {
      return userProject;
    }
  }

  const projects = {
    "1": {
      id: "1",
      title: "DeFi 자산 관리 플랫폼",
      shortDescription: "XRPL 기반의 자동화된 포트폴리오 관리 툴",
      description: `
        <p>DeFi 생태계가 급속히 성장하면서 개인 투자자들이 다양한 프로토콜과 자산을 관리하는 것이 점점 복잡해지고 있습니다. 
        저희 플랫폼은 XRPL의 강력한 기능을 활용하여 사용자가 쉽고 안전하게 DeFi 투자를 할 수 있도록 돕습니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>자동화된 포트폴리오 리밸런싱</li>
          <li>리스크 관리 및 손실 제한</li>
          <li>실시간 수익률 분석 및 보고</li>
          <li>다양한 DeFi 프로토콜 통합</li>
          <li>AI 기반 투자 추천 시스템</li>
        </ul>

        <h3>왜 XRPL인가?</h3>
        <p>XRPL은 빠른 거래 속도, 낮은 수수료, 그리고 뛰어난 확장성을 제공합니다. 
        특히 DEX와 AMM 기능을 통해 DeFi 서비스 구축에 최적화되어 있습니다.</p>

        <h3>로드맵</h3>
        <p>3개월 - MVP 개발 완료<br/>
        6개월 - 베타 테스트 및 감사<br/>
        9개월 - 메인넷 런칭<br/>
        12개월 - 고급 기능 추가</p>
      `,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      creator: "김개발자",
      creatorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      category: "DeFi",
      targetAmount: 100000,
      currentAmount: 75000,
      backers: 234,
      daysLeft: 15,
      createdAt: "2024-01-15",
      location: "Seoul, Korea",
      website: "https://defi-platform.example.com",
      status: "active" as const,
      tags: ["DeFi", "Portfolio", "XRPL", "AI"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "DEFI-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 234000,
      paymentFee: 0.5, // 0.5%
      successFee: 10, // 10%
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      updates: [
        {
          id: "1",
          title: "MVP 개발 진행 상황 업데이트",
          content: "핵심 기능 개발이 70% 완료되었습니다. UI/UX 디자인도 마무리 단계에 있습니다.",
          date: "2024-02-10",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
        },
        {
          id: "2", 
          title: "XRPL 테스트넷 통합 완료",
          content: "XRPL 테스트넷과의 통합을 성공적으로 완료했습니다. 곧 베타 테스트를 시작할 예정입니다.",
          date: "2024-02-05",
          image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "투자 최소 금액이 있나요?",
          answer: "최소 1 XRP부터 투자 가능합니다."
        },
        {
          question: "수수료는 얼마인가요?",
          answer: "플랫폼 수수료는 연간 관리 자산의 1%입니다."
        },
        {
          question: "언제 서비스가 시작되나요?",
          answer: "목표 달성 시 3개월 내 MVP를 출시할 예정입니다."
        }
      ],
      // 거버넌스 관련 데이터
      governance: {
        proposals: [
          {
            id: "1",
            title: "플랫폼 수수료 조정 제안",
            description: "현재 10%인 성공 수수료를 8%로 조정하는 제안입니다.",
            status: "active",
            votesFor: 150,
            votesAgainst: 45,
            totalVotes: 195,
            endDate: "2024-02-20"
          },
          {
            id: "2",
            title: "새로운 기능 추가 제안",
            description: "모바일 앱 개발을 위한 추가 펀딩 제안입니다.",
            status: "pending",
            votesFor: 0,
            votesAgainst: 0,
            totalVotes: 0,
            endDate: "2024-02-25"
          }
        ]
      },
      // 투명 리포트 데이터
      transparencyReports: [
        {
          id: "1",
          title: "개발팀 급여 지출",
          amount: 25000,
          category: "인력비",
          date: "2024-02-01",
          description: "개발팀 3명의 1월 급여 지출",
          txHash: "0x1234..."
        },
        {
          id: "2",
          title: "서버 인프라 비용",
          amount: 5000,
          category: "인프라",
          date: "2024-02-05",
          description: "AWS 클라우드 서버 비용",
          txHash: "0x5678..."
        }
      ]
    },
    "2": {
      id: "2",
      title: "NFT 마켓플레이스 dApp",
      shortDescription: "크리에이터를 위한 저수수료 NFT 거래 플랫폼. XRPL의 빠른 결제 시스템을 활용하여 즉시 거래가 가능합니다.",
      description: `
        <p>현재 NFT 마켓플레이스는 높은 수수료와 느린 거래 속도로 인해 크리에이터와 수집가들에게 부담이 되고 있습니다. 
        저희 플랫폼은 XRPL의 강력한 기능을 활용하여 이러한 문제를 해결하고자 합니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>초저수수료 거래 (기존 대비 90% 절약)</li>
          <li>즉시 거래 완료 (3초 이내)</li>
          <li>크리에이터 로열티 시스템</li>
          <li>XRP 기반 안전한 결제 시스템</li>
          <li>메타데이터 검증 및 저장</li>
        </ul>

        <h3>기술적 혁신</h3>
        <p>XRPL의 DEX 기능과 NFT 표준을 활용하여 중앙화된 거래소 없이도 안전하고 빠른 거래가 가능합니다.</p>

        <h3>로드맵</h3>
        <p>2개월 - MVP 개발 완료<br/>
        4개월 - 베타 테스트 시작<br/>
        6개월 - 메인넷 런칭<br/>
        8개월 - 고급 기능 추가</p>
      `,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
      creator: "박아티스트",
      creatorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
      category: "NFT",
      targetAmount: 50000,
      currentAmount: 52000,
      backers: 189,
      daysLeft: 0,
      createdAt: "2024-01-10",
      location: "Seoul, Korea",
      website: "https://nft-marketplace.example.com",
      status: "successful" as const,
      tags: ["NFT", "Marketplace", "Art"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "NFT-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 189000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-10", amount: 10000, backers: 25, txHash: "0x2001..." },
        { date: "2024-01-15", amount: 15000, backers: 45, txHash: "0x2002..." },
        { date: "2024-01-20", amount: 20000, backers: 78, txHash: "0x2003..." },
        { date: "2024-01-25", amount: 25000, backers: 120, txHash: "0x2004..." },
        { date: "2024-01-30", amount: 30000, backers: 150, txHash: "0x2005..." },
        { date: "2024-02-05", amount: 35000, backers: 170, txHash: "0x2006..." },
        { date: "2024-02-10", amount: 40000, backers: 180, txHash: "0x2007..." },
        { date: "2024-02-15", amount: 45000, backers: 185, txHash: "0x2008..." },
        { date: "2024-02-20", amount: 50000, backers: 189, txHash: "0x2009..." }
      ],
      updates: [
        {
          id: "1",
          title: "목표 달성! 감사합니다",
          content: "목표 금액 50,000 XRP를 달성했습니다. 모든 후원자분들께 감사드립니다.",
          date: "2024-02-20",
          image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop"
        },
        {
          id: "2",
          title: "베타 테스트 시작",
          content: "선별된 사용자들을 대상으로 베타 테스트를 시작합니다.",
          date: "2024-02-15",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "NFT 거래 수수료는 얼마인가요?",
          answer: "기존 플랫폼 대비 90% 절약된 0.1% 수수료를 적용합니다."
        },
        {
          question: "어떤 NFT 표준을 지원하나요?",
          answer: "XRPL의 XLS-20 NFT 표준을 완전히 지원합니다."
        }
      ],
      governance: {
        proposals: [
          {
            id: "1",
            title: "거래 수수료 조정 제안",
            description: "현재 0.1%인 거래 수수료를 0.05%로 조정하는 제안입니다.",
            status: "active",
            votesFor: 120,
            votesAgainst: 30,
            totalVotes: 150,
            endDate: "2024-03-01"
          }
        ]
      },
      transparencyReports: [
        {
          id: "1",
          title: "개발팀 급여",
          amount: 20000,
          category: "인력비",
          date: "2024-02-01",
          description: "개발팀 4명의 1월 급여",
          txHash: "0x2001..."
        },
        {
          id: "2",
          title: "마케팅 비용",
          amount: 15000,
          category: "마케팅",
          date: "2024-02-05",
          description: "온라인 광고 및 홍보 비용",
          txHash: "0x2002..."
        }
      ]
    },
    "3": {
      id: "3",
      title: "탈중앙화 소셜 네트워크",
      shortDescription: "사용자가 데이터를 완전히 소유하는 Web3 소셜 플랫폼. 검열 저항성과 투명성을 보장합니다.",
      description: `
        <p>현재 소셜 미디어 플랫폼들은 사용자의 데이터를 독점하고 검열을 통해 표현의 자유를 제한합니다. 
        저희는 완전히 탈중앙화된 소셜 네트워크를 구축하여 이러한 문제를 해결하고자 합니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>완전한 데이터 소유권</li>
          <li>검열 저항성</li>
          <li>익명성 보장</li>
          <li>토큰 기반 보상 시스템</li>
          <li>크로스 플랫폼 연동</li>
        </ul>

        <h3>기술적 특징</h3>
        <p>IPFS를 활용한 분산 저장과 XRPL의 결제 시스템을 결합하여 완전히 탈중앙화된 환경을 제공합니다.</p>

        <h3>로드맵</h3>
        <p>4개월 - 프로토콜 개발<br/>
        6개월 - 클라이언트 앱 개발<br/>
        8개월 - 베타 테스트<br/>
        12개월 - 메인넷 런칭</p>
      `,
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
      creator: "이블록체인",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "Social",
      targetAmount: 80000,
      currentAmount: 45000,
      backers: 156,
      daysLeft: 22,
      createdAt: "2024-01-05",
      location: "Seoul, Korea",
      website: "https://decentralized-social.example.com",
      status: "active" as const,
      tags: ["Social", "Privacy", "Web3"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "SOCIAL-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 156000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-05", amount: 5000, backers: 12, txHash: "0x3001..." },
        { date: "2024-01-10", amount: 10000, backers: 25, txHash: "0x3002..." },
        { date: "2024-01-15", amount: 15000, backers: 45, txHash: "0x3003..." },
        { date: "2024-01-20", amount: 20000, backers: 67, txHash: "0x3004..." },
        { date: "2024-01-25", amount: 25000, backers: 89, txHash: "0x3005..." },
        { date: "2024-01-30", amount: 30000, backers: 110, txHash: "0x3006..." },
        { date: "2024-02-05", amount: 35000, backers: 125, txHash: "0x3007..." },
        { date: "2024-02-10", amount: 40000, backers: 140, txHash: "0x3008..." },
        { date: "2024-02-15", amount: 45000, backers: 156, txHash: "0x3009..." }
      ],
      updates: [
        {
          id: "1",
          title: "프로토콜 설계 완료",
          content: "탈중앙화 소셜 네트워크의 핵심 프로토콜 설계가 완료되었습니다.",
          date: "2024-02-15",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "데이터는 어떻게 보호되나요?",
          answer: "IPFS를 활용한 분산 저장과 암호화를 통해 데이터를 보호합니다."
        },
        {
          question: "익명성을 어떻게 보장하나요?",
          answer: "제로지식 증명을 활용하여 신원을 노출하지 않고도 인증이 가능합니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "연구개발비",
          amount: 20000,
          category: "R&D",
          date: "2024-02-01",
          description: "프로토콜 연구 및 개발 비용",
          txHash: "0x3001..."
        }
      ]
    },
    "4": {
      id: "4",
      title: "AI 기반 트레이딩 봇",
      shortDescription: "머신러닝을 활용한 자동 거래 시스템으로 XRPL DEX에서 최적의 거래 기회를 찾아줍니다.",
      description: `
        <p>DeFi 거래의 복잡성과 24시간 시장 모니터링의 어려움을 해결하기 위해 AI 기반 자동 거래 봇을 개발합니다. 
        XRPL DEX의 실시간 데이터를 분석하여 최적의 거래 타이밍을 찾아줍니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>실시간 시장 분석</li>
          <li>AI 기반 가격 예측</li>
          <li>자동 리스크 관리</li>
          <li>다양한 거래 전략 지원</li>
          <li>수익률 최적화</li>
        </ul>

        <h3>AI 기술</h3>
        <p>LSTM과 Transformer 모델을 결합하여 시계열 데이터를 분석하고, 강화학습을 통해 거래 전략을 지속적으로 개선합니다.</p>

        <h3>로드맵</h3>
        <p>3개월 - AI 모델 개발<br/>
        5개월 - 백테스팅 완료<br/>
        7개월 - 베타 테스트<br/>
        9개월 - 메인넷 런칭</p>
      `,
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop",
      creator: "정AI연구원",
      creatorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      category: "AI",
      targetAmount: 120000,
      currentAmount: 89000,
      backers: 298,
      daysLeft: 8,
      createdAt: "2024-01-12",
      location: "Seoul, Korea",
      website: "https://ai-trading-bot.example.com",
      status: "active" as const,
      tags: ["AI", "Trading", "Automation"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "AI-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 298000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-12", amount: 10000, backers: 25, txHash: "0x4001..." },
        { date: "2024-01-17", amount: 20000, backers: 50, txHash: "0x4002..." },
        { date: "2024-01-22", amount: 30000, backers: 80, txHash: "0x4003..." },
        { date: "2024-01-27", amount: 40000, backers: 120, txHash: "0x4004..." },
        { date: "2024-02-01", amount: 50000, backers: 150, txHash: "0x4005..." },
        { date: "2024-02-06", amount: 60000, backers: 180, txHash: "0x4006..." },
        { date: "2024-02-11", amount: 70000, backers: 220, txHash: "0x4007..." },
        { date: "2024-02-16", amount: 80000, backers: 260, txHash: "0x4008..." },
        { date: "2024-02-21", amount: 89000, backers: 298, txHash: "0x4009..." }
      ],
      updates: [
        {
          id: "1",
          title: "AI 모델 훈련 완료",
          content: "1년간의 과거 데이터를 활용한 AI 모델 훈련이 완료되었습니다.",
          date: "2024-02-21",
          image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "어떤 거래 전략을 사용하나요?",
          answer: "시장 상황에 따라 다양한 전략을 자동으로 선택하는 적응형 시스템을 사용합니다."
        },
        {
          question: "리스크 관리는 어떻게 하나요?",
          answer: "AI가 실시간으로 리스크를 평가하고 자동으로 손실 제한을 설정합니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "AI 모델 개발비",
          amount: 30000,
          category: "R&D",
          date: "2024-02-01",
          description: "AI 모델 개발 및 훈련 비용",
          txHash: "0x4001..."
        }
      ]
    },
    "5": {
      id: "5",
      title: "GameFi RPG 플랫폼",
      shortDescription: "Play-to-Earn 메커니즘이 있는 블록체인 기반 RPG 게임. NFT 아이템과 토큰 보상을 제공합니다.",
      description: `
        <p>전통적인 RPG 게임의 재미와 블록체인 기술을 결합하여 플레이어가 게임을 즐기면서 동시에 수익을 얻을 수 있는 
        혁신적인 GameFi 플랫폼을 개발합니다. XRPL의 빠른 거래 속도를 활용하여 실시간 아이템 거래가 가능합니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>Play-to-Earn 메커니즘</li>
          <li>NFT 아이템 시스템</li>
          <li>실시간 PvP 전투</li>
          <li>길드 시스템</li>
          <li>크로스체인 호환성</li>
        </ul>

        <h3>게임플레이</h3>
        <p>플레이어는 캐릭터를 성장시키고, 퀘스트를 완료하며, 다른 플레이어와 전투하여 토큰과 NFT 아이템을 획득할 수 있습니다.</p>

        <h3>로드맵</h3>
        <p>6개월 - 게임 엔진 개발<br/>
        9개월 - 베타 테스트<br/>
        12개월 - 메인넷 런칭<br/>
        15개월 - 모바일 버전 출시</p>
      `,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
      creator: "최게임개발",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "Gaming",
      targetAmount: 200000,
      currentAmount: 156000,
      backers: 445,
      daysLeft: 12,
      createdAt: "2024-01-08",
      location: "Seoul, Korea",
      website: "https://gamefi-rpg.example.com",
      status: "active" as const,
      tags: ["Gaming", "NFT", "P2E"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "GAME-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 445000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-08", amount: 20000, backers: 50, txHash: "0x5001..." },
        { date: "2024-01-13", amount: 40000, backers: 100, txHash: "0x5002..." },
        { date: "2024-01-18", amount: 60000, backers: 150, txHash: "0x5003..." },
        { date: "2024-01-23", amount: 80000, backers: 200, txHash: "0x5004..." },
        { date: "2024-01-28", amount: 100000, backers: 250, txHash: "0x5005..." },
        { date: "2024-02-02", amount: 120000, backers: 300, txHash: "0x5006..." },
        { date: "2024-02-07", amount: 140000, backers: 350, txHash: "0x5007..." },
        { date: "2024-02-12", amount: 156000, backers: 445, txHash: "0x5008..." }
      ],
      updates: [
        {
          id: "1",
          title: "게임 엔진 개발 완료",
          content: "3D 게임 엔진과 블록체인 연동 시스템이 완성되었습니다.",
          date: "2024-02-12",
          image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "어떤 아이템이 NFT로 발행되나요?",
          answer: "무기, 방어구, 장신구 등 희귀한 아이템들이 NFT로 발행됩니다."
        },
        {
          question: "토큰 보상은 어떻게 받나요?",
          answer: "퀘스트 완료, 몬스터 처치, PvP 승리 등을 통해 토큰을 획득할 수 있습니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "게임 엔진 라이선스",
          amount: 50000,
          category: "개발",
          date: "2024-02-01",
          description: "Unity Pro 라이선스 구매",
          txHash: "0x5001..."
        }
      ]
    },
    "6": {
      id: "6",
      title: "탄소 크레딧 거래소",
      shortDescription: "투명한 탄소 크레딧 거래를 위한 블록체인 플랫폼. 환경 친화적 프로젝트 지원이 목표입니다.",
      description: `
        <p>기후 변화 대응을 위한 탄소 크레딧 거래의 투명성과 신뢰성을 확보하기 위해 블록체인 기술을 활용한 
        탄소 크레딧 거래소를 구축합니다. XRPL의 빠른 거래와 낮은 수수료를 활용하여 효율적인 거래를 지원합니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>탄소 크레딧 토큰화</li>
          <li>투명한 거래 기록</li>
          <li>자동 검증 시스템</li>
          <li>환경 프로젝트 지원</li>
          <li>국제 표준 준수</li>
        </ul>

        <h3>환경적 가치</h3>
        <p>블록체인 기술을 통해 탄소 크레딧의 진위성을 검증하고, 이중 계산을 방지하여 환경 보호의 실질적 효과를 높입니다.</p>

        <h3>로드맵</h3>
        <p>4개월 - 프로토콜 개발<br/>
        7개월 - 파트너십 구축<br/>
        10개월 - 베타 테스트<br/>
        12개월 - 메인넷 런칭</p>
      `,
      image: "https://images.unsplash.com/photo-1569163139719-de82de2efe87?w=800&h=400&fit=crop",
      creator: "환경보호단",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "ESG",
      targetAmount: 90000,
      currentAmount: 67000,
      backers: 201,
      daysLeft: 18,
      createdAt: "2024-01-15",
      location: "Seoul, Korea",
      website: "https://carbon-credit-exchange.example.com",
      status: "active" as const,
      tags: ["ESG", "Environment", "Trading"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "CARBON-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 201000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-15", amount: 10000, backers: 30, txHash: "0x6001..." },
        { date: "2024-01-20", amount: 20000, backers: 60, txHash: "0x6002..." },
        { date: "2024-01-25", amount: 30000, backers: 90, txHash: "0x6003..." },
        { date: "2024-01-30", amount: 40000, backers: 120, txHash: "0x6004..." },
        { date: "2024-02-04", amount: 50000, backers: 150, txHash: "0x6005..." },
        { date: "2024-02-09", amount: 60000, backers: 180, txHash: "0x6006..." },
        { date: "2024-02-14", amount: 67000, backers: 201, txHash: "0x6007..." }
      ],
      updates: [
        {
          id: "1",
          title: "환경부와 파트너십 체결",
          content: "환경부와 탄소 크레딧 검증 시스템 개발을 위한 MOU를 체결했습니다.",
          date: "2024-02-14",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "탄소 크레딧은 어떻게 검증되나요?",
          answer: "IoT 센서 데이터와 위성 이미지를 활용하여 자동으로 검증합니다."
        },
        {
          question: "어떤 환경 프로젝트를 지원하나요?",
          answer: "재생에너지, 산림 보호, 해양 보전 등 다양한 환경 프로젝트를 지원합니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "검증 시스템 개발",
          amount: 25000,
          category: "R&D",
          date: "2024-02-01",
          description: "탄소 크레딧 검증 시스템 개발 비용",
          txHash: "0x6001..."
        }
      ]
    },
    "7": {
      id: "7",
      title: "디지털 신원 관리 시스템",
      shortDescription: "자기주권적 신원(SSI) 관리 플랫폼으로 개인 데이터의 완전한 통제권을 제공합니다.",
      description: `
        <p>현재 개인의 신원 정보는 중앙화된 기관들에 의해 관리되어 개인의 통제권이 제한적입니다. 
        저희는 자기주권적 신원(Self-Sovereign Identity) 기술을 활용하여 개인이 자신의 신원 정보를 완전히 통제할 수 있는 시스템을 구축합니다.</p>
        
        <h3>주요 기능</h3>
        <ul>
          <li>자기주권적 신원 관리</li>
          <li>제로지식 증명</li>
          <li>크로스 플랫폼 호환성</li>
          <li>개인정보 보호</li>
          <li>디지털 서명</li>
        </ul>

        <h3>기술적 혁신</h3>
        <p>W3C DID 표준과 XRPL의 분산 원장을 활용하여 검증 가능한 신원 정보를 안전하게 관리합니다.</p>

        <h3>로드맵</h3>
        <p>5개월 - 프로토콜 개발<br/>
        8개월 - 모바일 앱 개발<br/>
        11개월 - 베타 테스트<br/>
        14개월 - 메인넷 런칭</p>
      `,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
      creator: "김보안전문가",
      creatorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      category: "Identity",
      targetAmount: 150000,
      currentAmount: 45000,
      backers: 123,
      daysLeft: 25,
      createdAt: "2024-01-20",
      location: "Seoul, Korea",
      website: "https://digital-identity.example.com",
      status: "active" as const,
      tags: ["Identity", "Security", "Privacy"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "ID-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 123000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-20", amount: 5000, backers: 15, txHash: "0x7001..." },
        { date: "2024-01-25", amount: 10000, backers: 30, txHash: "0x7002..." },
        { date: "2024-01-30", amount: 15000, backers: 45, txHash: "0x7003..." },
        { date: "2024-02-04", amount: 20000, backers: 60, txHash: "0x7004..." },
        { date: "2024-02-09", amount: 25000, backers: 75, txHash: "0x7005..." },
        { date: "2024-02-14", amount: 30000, backers: 90, txHash: "0x7006..." },
        { date: "2024-02-19", amount: 35000, backers: 105, txHash: "0x7007..." },
        { date: "2024-02-24", amount: 40000, backers: 120, txHash: "0x7008..." },
        { date: "2024-02-29", amount: 45000, backers: 123, txHash: "0x7009..." }
      ],
      updates: [
        {
          id: "1",
          title: "W3C 표준 준수 인증",
          content: "DID 표준 준수를 위한 W3C 인증을 받았습니다.",
          date: "2024-02-29",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "개인정보는 어떻게 보호되나요?",
          answer: "제로지식 증명을 통해 필요한 정보만 선택적으로 공개합니다."
        },
        {
          question: "어떤 신원 정보를 관리할 수 있나요?",
          answer: "신분증, 학력, 자격증, 의료 기록 등 다양한 신원 정보를 관리할 수 있습니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "보안 감사",
          amount: 20000,
          category: "보안",
          date: "2024-02-15",
          description: "외부 보안 감사 비용",
          txHash: "0x7001..."
        }
      ]
    },
    "8": {
      id: "8",
      title: "크로스체인 브릿지",
      shortDescription: "XRPL과 다른 블록체인 간의 자산 이동을 원활하게 해주는 인터체인 브릿지 프로토콜입니다.",
      description: `## 프로젝트 소개

다양한 블록체인 생태계가 발전하면서 서로 다른 체인 간의 자산 이동이 필요해지고 있습니다. 
저희는 XRPL을 중심으로 한 크로스체인 브릿지 프로토콜을 개발하여 안전하고 효율적인 자산 이동을 가능하게 합니다.

## 주요 기능

- 다중 체인 지원
- 자동화된 브릿지
- 낮은 수수료
- 빠른 처리 속도
- 보안 보장

## 지원 체인

Ethereum, BSC, Polygon, Solana 등 주요 블록체인과의 연동을 지원합니다.

## 로드맵

- 4개월 - 프로토콜 개발
- 7개월 - 첫 번째 브릿지 출시
- 10개월 - 추가 체인 지원
- 12개월 - 완전 자동화`,
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=400&fit=crop",
      creator: "브릿지팀",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "Infrastructure",
      targetAmount: 180000,
      currentAmount: 92000,
      backers: 267,
      daysLeft: 5,
      createdAt: "2024-01-18",
      location: "Seoul, Korea",
      website: "https://crosschain-bridge.example.com",
      status: "active" as const,
      tags: ["Bridge", "Interchain", "Protocol"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "BRIDGE-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 267000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-18", amount: 20000, backers: 40, txHash: "0x8001..." },
        { date: "2024-01-23", amount: 40000, backers: 80, txHash: "0x8002..." },
        { date: "2024-01-28", amount: 60000, backers: 120, txHash: "0x8003..." },
        { date: "2024-02-02", amount: 80000, backers: 160, txHash: "0x8004..." },
        { date: "2024-02-07", amount: 92000, backers: 267, txHash: "0x8005..." }
      ],
      updates: [
        {
          id: "1",
          title: "Ethereum 브릿지 테스트 완료",
          content: "XRPL-Ethereum 간 브릿지 테스트가 성공적으로 완료되었습니다.",
          date: "2024-02-07",
          image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "브릿지 수수료는 얼마인가요?",
          answer: "거래 금액의 0.1% 수수료를 적용하며, 최소 수수료는 1 XRP입니다."
        },
        {
          question: "브릿지 시간은 얼마나 걸리나요?",
          answer: "일반적으로 5-10분 내에 완료되며, 네트워크 상황에 따라 달라질 수 있습니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "보안 감사",
          amount: 30000,
          category: "보안",
          date: "2024-02-01",
          description: "스마트 컨트랙트 보안 감사 비용",
          txHash: "0x8001..."
        }
      ]
    },
    "9": {
      id: "9",
      title: "실패한 프로젝트 예시",
      shortDescription: "목표 금액을 달성하지 못한 프로젝트입니다.",
      description: `
        <p>이 프로젝트는 크라우드펀딩에서 목표 금액을 달성하지 못한 실패 사례를 보여주는 예시입니다. 
        Web3 크라우드펀딩에서도 목표 미달 시 자동 환불이 보장되는 것을 확인할 수 있습니다.</p>
        
        <h3>실패 원인</h3>
        <ul>
          <li>마케팅 부족으로 인한 인지도 부족</li>
          <li>목표 금액 설정이 너무 높았음</li>
          <li>타겟 고객층 분석 부족</li>
          <li>경쟁사 대비 차별화 부족</li>
        </ul>

        <h3>교훈</h3>
        <p>크라우드펀딩 성공을 위해서는 충분한 사전 준비와 마케팅, 그리고 현실적인 목표 설정이 중요합니다.</p>
      `,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      creator: "실패팀",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      category: "DeFi",
      targetAmount: 100000,
      currentAmount: 25000,
      backers: 45,
      daysLeft: 0,
      createdAt: "2024-01-01",
      location: "Seoul, Korea",
      website: "",
      status: "failed" as const,
      tags: ["Failed", "Example"],
      // Web3 크라우드펀딩 관련 데이터
      escrowAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      proofTokenSymbol: "FAIL-PROOF",
      proofTokenTotal: 1000000,
      proofTokenDistributed: 45000,
      paymentFee: 0.5,
      successFee: 10,
      kycVerified: true,
      smartContractVerified: true,
      escrowProtected: true,
      autoRefund: true,
      fundingHistory: [
        { date: "2024-01-01", amount: 5000, backers: 5, txHash: "0x1111..." },
        { date: "2024-01-05", amount: 10000, backers: 12, txHash: "0x2222..." },
        { date: "2024-01-10", amount: 15000, backers: 20, txHash: "0x3333..." },
        { date: "2024-01-15", amount: 20000, backers: 28, txHash: "0x4444..." },
        { date: "2024-01-20", amount: 25000, backers: 45, txHash: "0x5555..." }
      ],
      updates: [
        {
          id: "1",
          title: "프로젝트 중단 공지",
          content: "목표 금액 달성이 어려워 프로젝트를 중단합니다. 모든 투자금은 자동으로 환불됩니다.",
          date: "2024-01-25",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
        }
      ],
      faqs: [
        {
          question: "투자금은 언제 환불되나요?",
          answer: "목표 미달 시 자동으로 7일 내에 환불됩니다."
        },
        {
          question: "Proof Token은 어떻게 되나요?",
          answer: "프로젝트 실패 시 Proof Token은 소각됩니다."
        }
      ],
      governance: {
        proposals: []
      },
      transparencyReports: [
        {
          id: "1",
          title: "마케팅 비용 지출",
          amount: 15000,
          category: "마케팅",
          date: "2024-01-10",
          description: "온라인 광고 및 홍보 비용",
          txHash: "0x1111..."
        },
        {
          id: "2",
          title: "개발비 지출",
          amount: 10000,
          category: "개발",
          date: "2024-01-15",
          description: "초기 개발 비용",
          txHash: "0x2222..."
        }
      ]
    }
  };
  
  return projects[id as keyof typeof projects] || null;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [fundingAmount, setFundingAmount] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [userProofTokens, setUserProofTokens] = useState(0);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("XRP");
  const [selectedToken, setSelectedToken] = useState<{symbol: string, issuer: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fundingError, setFundingError] = useState("");
  const [fundingSuccess, setFundingSuccess] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [escrowInfo, setEscrowInfo] = useState<{sequence?: number, finishAfter?: number, cancelAfter?: number} | null>(null);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  
  // Use wallet store
  const { isConnected, address, secret, walletType, network, balance, updateBalance } = useWalletStore();
  
  const project = getProjectById(params.id as string);
  
  // Force re-render when refreshTrigger changes
  React.useEffect(() => {
    // This will cause the component to re-render and get fresh project data
  }, [refreshTrigger]);

  // 프로젝트가 사용자가 생성한 것인지 확인
  const isUserProject = () => {
    if (typeof window !== 'undefined') {
      const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      return userProjects.some((p: { id: string }) => p.id === params.id);
    }
    return false;
  };

  // 프로젝트 삭제 함수
  const deleteProject = async () => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      if (typeof window !== 'undefined') {
        const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        const updatedProjects = userProjects.filter((p: { id: string }) => p.id !== params.id);
        localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
        
        toast.success("프로젝트가 성공적으로 삭제되었습니다.");
        
        // 프로젝트 목록 페이지로 리다이렉트
        router.push('/projects');
      }
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      toast.error("프로젝트 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) {
    notFound();
  }

  const progressPercentage = (project.currentAmount / project.targetAmount) * 100;
  const proofTokenPercentage = (project.proofTokenDistributed / project.proofTokenTotal) * 100;

  // Web3 기능들
  const handleConnectWallet = () => {
    setIsLoading(true);
    // 실제로는 XRPL 지갑 연결 로직
    setTimeout(() => {
      setUserProofTokens(1500); // Mock 데이터
      setIsLoading(false);
      toast.success("지갑이 연결되었습니다!");
    }, 2000);
  };

  const handleFunding = () => {
    if (!isConnected) {
      setFundingError("먼저 지갑을 연결해주세요!");
      return;
    }
    if (!fundingAmount || parseFloat(fundingAmount) < 1) {
      setFundingError("최소 1 XRP 이상 투자해주세요!");
      return;
    }
    if (parseFloat(fundingAmount) > balance.xrp) {
      setFundingError("잔액이 부족합니다!");
      return;
    }
    // Clear any previous errors and success messages
    setFundingError("");
    setFundingSuccess("");
    setShowFundingModal(true);
  };

  const handleConfirmFunding = async () => {
    if (!secret || !address) {
      toast.error("지갑 정보를 찾을 수 없습니다!");
      return;
    }

    setIsLoading(true);
    
    try {
      // Get project creator's address (in real app, this would come from project data)
      // Use a known testnet address that should work
      const projectCreatorAddress = project.escrowAddress || "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH";
      
      // Send payment (XRP, RLUSD, or IOU token)
      let paymentResult;
      if (selectedCurrency === "XRP" || selectedCurrency === "RLUSD") {
        // XRP and RLUSD are native currencies, use XRP payment
        paymentResult = await sendXRPPayment(
          secret,
          projectCreatorAddress,
          parseFloat(fundingAmount),
          network
        );
      } else if (selectedToken) {
        // Check if trustline exists for IOU token
        const trustlineCheck = await checkTrustline(
          address!,
          selectedToken.symbol,
          selectedToken.issuer,
          network
        );

        if (!trustlineCheck.exists) {
          // Setup trustline first
          setFundingError("토큰을 사용하기 위해 먼저 트러스트라인을 설정합니다...");
          
          const trustlineResult = await setupTrustline(
            secret,
            selectedToken.issuer,
            selectedToken.symbol,
            "1000000", // 1M limit
            network
          );

          if (!trustlineResult.success) {
            setFundingError(`트러스트라인 설정 실패: ${trustlineResult.error}`);
            return;
          }

          setFundingError(""); // Clear error message
        }

        // Now send IOU payment
        paymentResult = await sendIOUPayment(
          secret,
          projectCreatorAddress,
          selectedToken.symbol,
          selectedToken.issuer,
          fundingAmount,
          network
        );
      } else {
        setFundingError("토큰 정보를 찾을 수 없습니다!");
        return;
      }

      if (paymentResult.success) {
        // Update project funding amount in localStorage
        if (typeof window !== 'undefined') {
          // Update user-created projects
          const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
          const userProjectIndex = userProjects.findIndex((p: { id: string }) => p.id === params.id);
          
          if (userProjectIndex !== -1) {
            userProjects[userProjectIndex].currentAmount += parseFloat(fundingAmount);
            userProjects[userProjectIndex].backers += 1;
            localStorage.setItem('userProjects', JSON.stringify(userProjects));
          }
          
          // Update all projects (including mock projects) in a separate storage
          const allProjects = JSON.parse(localStorage.getItem('allProjects') || '[]');
          let projectIndex = allProjects.findIndex((p: { id: string }) => p.id === params.id);
          
          // Create funding history entry
          const fundingEntry = {
            amount: parseFloat(fundingAmount),
            currency: selectedCurrency,
            token: selectedToken,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            backers: 1,
            txHash: paymentResult.txHash || 'Unknown'
          };
          
          if (projectIndex === -1) {
            // If project not in allProjects, add it (for mock projects)
            const currentProject = getProjectById(params.id as string);
            if (currentProject) {
              allProjects.push({
                ...currentProject,
                currentAmount: parseFloat(fundingAmount),
                backers: 1,
                fundingHistory: [fundingEntry]
              });
            }
          } else {
            // Update existing project
            allProjects[projectIndex].currentAmount += parseFloat(fundingAmount);
            allProjects[projectIndex].backers += 1;
            
            // Add to funding history
            if (!allProjects[projectIndex].fundingHistory) {
              allProjects[projectIndex].fundingHistory = [];
            }
            allProjects[projectIndex].fundingHistory.unshift(fundingEntry); // Add to beginning
            
            // Keep only last 10 entries to avoid too much data
            if (allProjects[projectIndex].fundingHistory.length > 10) {
              allProjects[projectIndex].fundingHistory = allProjects[projectIndex].fundingHistory.slice(0, 10);
            }
          }
          
          localStorage.setItem('allProjects', JSON.stringify(allProjects));
        }

        // Update wallet balance
        await updateBalance();
        
        // Show success message in funding section
        setFundingError("");
        setFundingSuccess(`투자가 성공적으로 완료되었습니다! TX: ${paymentResult.txHash}`);
      setShowFundingModal(false);
      setFundingAmount("");
        
        // Trigger refresh to update project data
        setRefreshTrigger(prev => prev + 1);
      } else {
        setFundingError(`투자 실패: ${paymentResult.error}`);
      }
    } catch (error) {
      setFundingError("투자 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateEscrow = async () => {
    if (!secret || !address) {
      setFundingError("지갑을 연결해주세요!");
      return;
    }

    setIsLoading(true);
    setFundingError("");

    try {
      // Create escrow for project funding with a smaller test amount
      const testAmount = 10; // Test with 10 XRP instead of full target amount
      
      const escrowResult = await createProjectEscrow(
        secret,
        address, // Project creator receives funds
        testAmount, // Use smaller test amount
        selectedCurrency,
        selectedToken?.issuer,
        30, // 30 days to release
        60, // 60 days to cancel
        network
      );

      if (escrowResult.success) {
        setEscrowInfo({
          sequence: escrowResult.sequence,
          finishAfter: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancelAfter: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60)
        });
        setFundingSuccess(`에스크로가 성공적으로 생성되었습니다! (테스트 금액: ${testAmount} ${selectedCurrency}) TX: ${escrowResult.txHash}`);
        setShowEscrowModal(false);
      } else {
        setFundingError(`에스크로 생성 실패: ${escrowResult.error}`);
      }
    } catch (error) {
      setFundingError("에스크로 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    if (!secret || !address || !escrowInfo?.sequence) {
      setFundingError("에스크로 정보를 찾을 수 없습니다!");
      return;
    }

    setIsLoading(true);
    setFundingError("");

    try {
      const releaseResult = await releaseProjectFunds(
        secret,
        address,
        escrowInfo.sequence,
        network
      );

      if (releaseResult.success) {
        setFundingSuccess(`자금이 성공적으로 해제되었습니다! TX: ${releaseResult.txHash}`);
        setEscrowInfo(null);
      } else {
        setFundingError(`자금 해제 실패: ${releaseResult.error}`);
      }
    } catch (error) {
      setFundingError("자금 해제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundFunds = async () => {
    if (!secret || !address || !escrowInfo?.sequence) {
      setFundingError("에스크로 정보를 찾을 수 없습니다!");
      return;
    }

    setIsLoading(true);
    setFundingError("");

    try {
      const refundResult = await refundProjectFunds(
        secret,
        address,
        escrowInfo.sequence,
        network
      );

      if (refundResult.success) {
        setFundingSuccess(`자금이 성공적으로 환불되었습니다! TX: ${refundResult.txHash}`);
        setEscrowInfo(null);
      } else {
        setFundingError(`자금 환불 실패: ${refundResult.error}`);
      }
    } catch (error) {
      setFundingError("자금 환불 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = (proposalId: string, vote: "for" | "against") => {
    if (!isConnected) {
      toast.error("먼저 지갑을 연결해주세요!");
      return;
    }
    if (userProofTokens === 0) {
      toast.error("Proof Token이 필요합니다!");
      return;
    }
    toast.success(`제안 ${proposalId}에 ${vote === "for" ? "찬성" : "반대"} 투표했습니다!`);
  };

  return (
    <div className="min-h-screen gradient-dark main-content">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              프로젝트 목록으로
            </Button>
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 relative group">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge variant={
                project.status === "active" ? "success" : 
                project.status === "successful" ? "info" : 
                "destructive"
              }>
                {project.status === "active" ? "진행중" : 
                 project.status === "successful" ? "성공" : 
                 project.status === "failed" ? "실패" : "종료"}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="glass border-white/20 text-white">
                {project.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {project.title}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{project.shortDescription}</p>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {project.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="hover:bg-purple-500/10 hover:border-purple-400/50 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  {project.creator}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  {project.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  {project.createdAt}
                </div>
              </div>
            </div>
            
            {/* 삭제 버튼 - 사용자가 생성한 프로젝트인 경우에만 표시 */}
            {isUserProject() && (
              <div className="ml-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteProject}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "삭제 중..." : "삭제"}
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`hover:bg-red-500/10 ${isLiked ? "text-red-400" : "text-gray-400"}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-blue-500/10 text-gray-400 hover:text-blue-400">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Web3 Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 glass">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  개요
                </TabsTrigger>
                <TabsTrigger value="funding" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  펀딩
                </TabsTrigger>
                <TabsTrigger value="governance" className="flex items-center gap-2">
                  <Vote className="w-4 h-4" />
                  거버넌스
                </TabsTrigger>
                <TabsTrigger value="transparency" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  투명성
                </TabsTrigger>
                <TabsTrigger value="business-plan" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  사업계획서
                </TabsTrigger>
                <TabsTrigger value="updates" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  업데이트
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <OverviewTab project={project} />

              {/* Funding Tab */}
              <TabsContent value="funding" className="space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      펀딩 참여
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!isConnected ? (
                      <div className="text-center py-8">
                        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">지갑 연결 필요</h3>
                        <p className="text-gray-400 mb-6">펀딩에 참여하려면 XRPL 지갑을 연결해주세요</p>
                        <Button 
                          variant="primary" 
                          onClick={handleConnectWallet}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                          지갑 연결하기
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            투자 금액
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={fundingAmount}
                              onChange={(e) => setFundingAmount(e.target.value)}
                              placeholder="1"
                              min="1"
                              className="flex-1 px-4 py-3 glass rounded-xl text-white border border-white/10 focus:border-purple-500/50 focus:outline-none"
                            />
                            <select
                              value={selectedCurrency}
                              onChange={(e) => {
                                setSelectedCurrency(e.target.value);
                                if (e.target.value === "XRP" || e.target.value === "RLUSD") {
                                  setSelectedToken(null);
                                } else {
                                  // Set default token issuer for IOU tokens only
                                  const tokenMap: {[key: string]: {symbol: string, issuer: string}} = {
                                    "USDC": {symbol: "USDC", issuer: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"},
                                    "USDT": {symbol: "USDT", issuer: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"}
                                  };
                                  setSelectedToken(tokenMap[e.target.value] || null);
                                }
                              }}
                              className="px-4 py-3 pr-8 glass rounded-xl text-white border border-white/10 focus:border-purple-500/50 focus:outline-none appearance-none bg-no-repeat bg-right bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]"
                            >
                              <option value="XRP">XRP</option>
                              <option value="USDC">USDC</option>
                              <option value="USDT">USDT</option>
                              <option value="RLUSD">RLUSD</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="p-4 glass rounded-lg">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">결제 수수료 ({project.paymentFee}%)</span>
                            <span className="text-white">
                              {fundingAmount ? (parseFloat(fundingAmount) * project.paymentFee / 100).toFixed(2) : 0} {selectedCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">실제 투자 금액</span>
                            <span className="text-white font-semibold">
                              {fundingAmount ? (parseFloat(fundingAmount) * (1 - project.paymentFee / 100)).toFixed(2) : 0} {selectedCurrency}
                            </span>
                          </div>
                        </div>

                        {/* Error Message Display */}
                        {fundingError && (
                          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-400 text-sm">{fundingError}</span>
                            </div>
                          </div>
                        )}

                        {/* Success Message Display */}
                        {fundingSuccess && (
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-400 text-sm">{fundingSuccess}</span>
                            </div>
                          </div>
                        )}


                        <Button 
                          variant="primary" 
                          onClick={handleFunding}
                          className="w-full py-3 text-lg font-semibold gap-2"
                        >
                          <Send className="w-5 h-5" />
                          투자하기
                        </Button>

                        {/* Escrow Management Section - Only for project creators */}
                        {isUserProject() && (
                          <div className="mt-6 p-4 glass rounded-lg border border-purple-500/30">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-purple-400" />
                              에스크로 관리
                            </h3>
                            
                            {!escrowInfo ? (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-400">
                                  프로젝트 자금을 안전하게 관리하기 위해 에스크로를 설정하세요.
                                </p>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowEscrowModal(true)}
                                  className="w-full"
                                >
                                  에스크로 설정하기
                        </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-sm text-gray-400">
                                  <p>에스크로 설정됨 (Sequence: {escrowInfo.sequence})</p>
                                  <p>해제 가능: {new Date(escrowInfo.finishAfter! * 1000).toLocaleDateString()}</p>
                                  <p>취소 가능: {new Date(escrowInfo.cancelAfter! * 1000).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={handleReleaseFunds}
                                    disabled={isLoading}
                                    className="flex-1"
                                  >
                                    자금 해제
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={handleRefundFunds}
                                    disabled={isLoading}
                                    className="flex-1"
                                  >
                                    환불하기
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Funding History */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      펀딩 히스토리
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.fundingHistory && project.fundingHistory.length > 0 ? (
                        project.fundingHistory.map((item: { amount: number; currency?: string; token?: any; date: string; backers: number; txHash: string }, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 glass rounded-lg">
                            <div>
                              <p className="text-white font-semibold">
                                {item.amount.toLocaleString()} {item.currency || 'XRP'}
                              </p>
                              <p className="text-sm text-gray-400">{item.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">{item.backers}명 참여</p>
                              <p className="text-xs text-gray-500 font-mono">
                                {item.txHash.length > 8 ? `${item.txHash.substring(0, 8)}...` : item.txHash}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">아직 펀딩 히스토리가 없습니다.</p>
                          <p className="text-sm text-gray-500 mt-1">첫 번째 투자자가 되어보세요!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Governance Tab */}
              <TabsContent value="governance" className="space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Vote className="w-5 h-5 text-purple-400" />
                      거버넌스 제안
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.governance?.proposals && project.governance.proposals.length > 0 ? (
                      project.governance.proposals.map((proposal: { id: string; title: string; description: string; status: string; votesFor: number; votesAgainst: number; totalVotes: number }) => (
                      <div key={proposal.id} className="p-4 glass rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-white font-semibold">{proposal.title}</h4>
                          <Badge variant={proposal.status === "active" ? "success" : "outline"}>
                            {proposal.status === "active" ? "진행중" : "대기중"}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">{proposal.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">찬성</span>
                            <span className="text-green-400">{proposal.votesFor}표</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">반대</span>
                            <span className="text-red-400">{proposal.votesAgainst}표</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                              style={{ 
                                width: `${proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>

                        {proposal.status === "active" && isConnected && userProofTokens > 0 && (
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleVote(proposal.id, "for")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              찬성
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleVote(proposal.id, "against")}
                            >
                              <X className="w-4 h-4 mr-1" />
                              반대
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                    ) : (
                      <div className="text-center py-8">
                        <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">아직 거버넌스 제안이 없습니다</p>
                        <p className="text-sm text-gray-500">첫 번째 제안을 만들어보세요!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transparency Tab */}
              <TabsContent value="transparency" className="space-y-6">
                <TransparencyChart projectId={project.id} />
              </TabsContent>

              {/* Business Plan Tab */}
              <TabsContent value="business-plan" className="space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      사업계획서
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {project.businessPlan ? (
                      <div className="space-y-4">
                        {/* 사업계획서 정보 */}
                        <div className="p-6 glass rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                        </div>
                              <div>
                                <h3 className="text-white font-semibold text-lg">{project.businessPlan.fileName}</h3>
                                <p className="text-gray-400 text-sm">
                                  {(project.businessPlan.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                      </div>
                            </div>
                            <Button
                              variant="primary"
                              onClick={() => {
                                // 실제로는 서버에서 파일을 다운로드하는 로직이 필요
                                toast.success('사업계획서 다운로드가 시작됩니다.');
                              }}
                              className="gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              다운로드
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">업로드 일시:</span>
                              <span className="text-white">
                                {new Date(project.businessPlan.uploadedAt).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">파일 형식:</span>
                              <span className="text-white">
                                {project.businessPlan.fileName.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 사업계획서 미리보기 (PDF인 경우) */}
                        {project.businessPlan.fileName.toLowerCase().endsWith('.pdf') && (
                          <div className="glass rounded-lg p-6">
                            <h4 className="text-white font-semibold mb-4">사업계획서 미리보기</h4>
                            <div className="bg-gray-800 rounded-lg p-8 text-center">
                              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-400 mb-4">PDF 미리보기를 준비 중입니다</p>
                              <p className="text-gray-500 text-sm">
                                현재는 파일 다운로드만 지원됩니다. 곧 미리보기 기능이 추가될 예정입니다.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 사업계획서 요약 정보 */}
                        <div className="glass rounded-lg p-6">
                          <h4 className="text-white font-semibold mb-4">사업계획서 요약</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-400 mb-2">
                                {project.businessPlan.fileName.split('.').pop()?.toUpperCase()}
                              </div>
                              <div className="text-gray-400 text-sm">파일 형식</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                              <div className="text-2xl font-bold text-green-400 mb-2">
                                {(project.businessPlan.fileSize / 1024 / 1024).toFixed(1)}MB
                              </div>
                              <div className="text-gray-400 text-sm">파일 크기</div>
                            </div>
                            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-400 mb-2">
                                ✓
                              </div>
                              <div className="text-gray-400 text-sm">검증 완료</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">사업계획서가 없습니다</h3>
                        <p className="text-gray-400 mb-6">이 프로젝트에는 업로드된 사업계획서가 없습니다.</p>
                        <Button variant="outline" disabled>
                          <FileText className="w-4 h-4 mr-2" />
                          사업계획서 없음
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Updates Tab */}
              <TabsContent value="updates" className="space-y-6">
                {project.updates && project.updates.length > 0 ? (
                  project.updates.map((update: { id: string; title: string; content: string; date: string; image?: string }) => (
                  <Card key={update.id} className="glass hover:bg-white/5 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                          {update.title}
                        </CardTitle>
                        <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                          {update.date}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {update.image && (
                        <img 
                          src={update.image} 
                          alt={update.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <p className="text-gray-300 leading-relaxed">{update.content}</p>
                    </CardContent>
                  </Card>
                ))
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">아직 업데이트가 없습니다</p>
                    <p className="text-sm text-gray-500">프로젝트 소식을 공유해보세요!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Status */}
            <Card className="glass border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Target className="w-6 h-6 text-purple-400" />
                  펀딩 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-3xl font-bold text-white">
                      {project.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-purple-400">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4 mb-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 h-4 rounded-full transition-all duration-500 neon-glow"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm">
                    목표: {project.targetAmount.toLocaleString()} XRP
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 glass rounded-xl">
                    <div className="text-2xl font-bold text-white mb-1">{project.backers}</div>
                    <div className="text-sm text-gray-400">후원자</div>
                  </div>
                  <div className="text-center p-4 glass rounded-xl">
                    <div className="text-2xl font-bold text-white mb-1">{project.daysLeft}</div>
                    <div className="text-sm text-gray-400">일 남음</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proof Token Status */}
            <Card className="glass border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Proof Token
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white">{project.proofTokenDistributed.toLocaleString()}</span>
                    <span className="text-sm text-gray-400">{proofTokenPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                      style={{ width: `${proofTokenPercentage}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm">
                    총 발행량: {project.proofTokenTotal.toLocaleString()}
                  </div>
                </div>

                {isConnected && (
                  <div className="p-3 glass rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">내 보유량</span>
                      <span className="text-white font-semibold">{userProofTokens.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card className="glass border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-cyan-400" />
                  창작자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={project.creatorImage}
                    alt={project.creator}
                    className="w-16 h-16 rounded-full border-2 border-purple-400/30"
                  />
                  <div>
                    <h4 className="font-semibold text-white text-lg">{project.creator}</h4>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.8 (23 reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 glass rounded-lg">
                    <span className="text-gray-400 font-medium">성공한 프로젝트</span>
                    <span className="text-white font-semibold">3개</span>
                  </div>
                  <div className="flex justify-between items-center p-3 glass rounded-lg">
                    <span className="text-gray-400 font-medium">총 펀딩액</span>
                    <span className="text-white font-semibold">450K XRP</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MPToken Information */}
            {project.mptoken && project.mptoken.created && (
              <Card className="glass border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    MPToken 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">토큰 이름</span>
                        <p className="text-white font-semibold">{project.mptoken.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">토큰 심볼</span>
                        <p className="text-white font-semibold">{project.mptoken.symbol}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">총 발행량</span>
                        <p className="text-white font-semibold">{project.mptoken.totalSupply.toLocaleString()} {project.mptoken.symbol}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">토큰 설명</span>
                        <p className="text-white text-sm">{project.mptoken.description || "설명 없음"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">발행 ID</span>
                        <p className="text-white text-xs font-mono break-all">{project.mptoken.issuanceId}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Token Distribution */}
                  <div className="space-y-3">
                    <h5 className="text-white font-semibold">토큰 배분 계획</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between items-center p-3 glass rounded-lg">
                        <span className="text-gray-300 text-sm">투자자</span>
                        <span className="text-white font-semibold">{project.mptoken.distribution.investors}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 glass rounded-lg">
                        <span className="text-gray-300 text-sm">팀</span>
                        <span className="text-white font-semibold">{project.mptoken.distribution.team}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 glass rounded-lg">
                        <span className="text-gray-300 text-sm">커뮤니티</span>
                        <span className="text-white font-semibold">{project.mptoken.distribution.community}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 glass rounded-lg">
                        <span className="text-gray-300 text-sm">보유분</span>
                        <span className="text-white font-semibold">{project.mptoken.distribution.reserves}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Token Benefits */}
                  <div className="space-y-3">
                    <h5 className="text-white font-semibold">토큰 혜택</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 glass rounded-lg">
                        <h6 className="text-white font-semibold text-sm mb-1">투표권</h6>
                        <p className="text-gray-400 text-xs">프로젝트 의사결정에 참여</p>
                      </div>
                      <div className="p-3 glass rounded-lg">
                        <h6 className="text-white font-semibold text-sm mb-1">수익 분배</h6>
                        <p className="text-gray-400 text-xs">프로젝트 수익의 일정 부분</p>
                      </div>
                      <div className="p-3 glass rounded-lg">
                        <h6 className="text-white font-semibold text-sm mb-1">특별 혜택</h6>
                        <p className="text-gray-400 text-xs">완성품 우선 구매권 등</p>
                      </div>
                      <div className="p-3 glass rounded-lg">
                        <h6 className="text-white font-semibold text-sm mb-1">거버넌스</h6>
                        <p className="text-gray-400 text-xs">프로젝트 방향성 제안권</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Status */}
            <Card className="glass border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                  보안 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300 font-medium">KYC 인증 완료</span>
                </div>
                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300 font-medium">스마트 컨트랙트 검증</span>
                </div>
                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300 font-medium">에스크로 보호</span>
                </div>
                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300 font-medium">자동 환불 보장</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Funding Modal */}
        {showFundingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 glass border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  투자 확인
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">투자 금액</span>
                    <span className="text-white">{fundingAmount} {selectedCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">결제 수수료 ({project.paymentFee}%)</span>
                    <span className="text-white">{(parseFloat(fundingAmount) * project.paymentFee / 100).toFixed(2)} {selectedCurrency}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">총 결제 금액</span>
                    <span className="text-white">{parseFloat(fundingAmount).toFixed(2)} {selectedCurrency}</span>
                  </div>
                </div>
                
                <div className="p-3 glass rounded-lg">
                  <p className="text-sm text-gray-300">
                    투자 시 {((parseFloat(fundingAmount) / project.currentAmount) * 100).toFixed(2)}%의 Proof Token을 받게 됩니다.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFundingModal(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleConfirmFunding}
                    disabled={isLoading}
                    className="flex-1 gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isLoading ? "처리중..." : "투자하기"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Escrow Setup Modal */}
        {showEscrowModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg mx-4 glass border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  에스크로 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      에스크로 통화
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => {
                        setSelectedCurrency(e.target.value);
                        if (e.target.value === "XRP" || e.target.value === "RLUSD") {
                          setSelectedToken(null);
                        } else {
                          const tokenMap: {[key: string]: {symbol: string, issuer: string}} = {
                            "USDC": {symbol: "USDC", issuer: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"},
                            "USDT": {symbol: "USDT", issuer: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"}
                          };
                          setSelectedToken(tokenMap[e.target.value] || null);
                        }
                      }}
                      className="w-full px-4 py-3 pr-8 glass rounded-xl text-white border border-white/10 focus:border-purple-500/50 focus:outline-none appearance-none bg-no-repeat bg-right bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]"
                    >
                      <option value="XRP">XRP</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="RLUSD">RLUSD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      에스크로 금액
                    </label>
                    <input
                      type="number"
                      value="10"
                      disabled
                      className="w-full px-4 py-3 glass rounded-xl text-white border border-white/10 bg-gray-800/50"
                    />
                    <p className="text-xs text-gray-400 mt-1">테스트용으로 10 {selectedCurrency}가 에스크로됩니다</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        자금 해제 기간 (일)
                      </label>
                      <input
                        type="number"
                        value="30"
                        disabled
                        className="w-full px-4 py-3 glass rounded-xl text-white border border-white/10 bg-gray-800/50"
                      />
                      <p className="text-xs text-gray-400 mt-1">30일 후 자금 해제 가능</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        환불 기간 (일)
                      </label>
                      <input
                        type="number"
                        value="60"
                        disabled
                        className="w-full px-4 py-3 glass rounded-xl text-white border border-white/10 bg-gray-800/50"
                      />
                      <p className="text-xs text-gray-400 mt-1">60일 후 환불 가능</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 glass rounded-lg border border-purple-500/30">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    에스크로 보호 기능
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 투자자 자금을 안전하게 보관</li>
                    <li>• 목표 달성 시 자동으로 자금 해제</li>
                    <li>• 프로젝트 실패 시 자동 환불</li>
                    <li>• 모든 거래가 블록체인에 기록</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEscrowModal(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleCreateEscrow}
                    disabled={isLoading}
                    className="flex-1 gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    {isLoading ? "설정 중..." : "에스크로 설정"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

