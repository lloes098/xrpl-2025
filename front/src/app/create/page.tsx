"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import { FeeStructureCard } from "@/components/project/FeeStructureCard";
import { 
  Rocket, 
  Target, 
  FileText, 
  Image,
  Video,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { createMPToken, CreateMPTRequest } from "@/lib/api/mpt";

interface ProjectForm {
  // Basic Info
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  
  // Media
  mainImage: string;
  additionalImages: string[];
  videoUrl: string;
  
  // Funding
  targetAmount: number;
  minimumPledge: number;
  duration: number;
  currency: "XRP" | "RLUSD";
  
  // Creator Info
  creatorName: string;
  creatorBio: string;
  businessPlan: File | null;
  
  // Project Details
  projectGoals: string;
  risks: string;
  timeline: string;
  
  // MPToken Configuration
  createMPToken: boolean;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  totalSupply: number;
  tokenDistribution: {
    investors: number;
    team: number;
    community: number;
    reserves: number;
  };
  tokenBenefits: {
    votingRights: boolean;
    profitSharing: boolean;
    specialBenefits: boolean;
    governance: boolean;
  };
}

const steps = [
  { id: 1, title: "프로젝트 정보", description: "기본 정보 입력" },
  { id: 2, title: "미디어 & 콘텐츠", description: "이미지/영상 업로드" },
  { id: 3, title: "펀딩 설정", description: "목표액 & 기간" },
  { id: 4, title: "토큰 설정", description: "MPToken 구성" },
  { id: 5, title: "창작자 정보", description: "프로필 & 사업계획서" },
  { id: 6, title: "프로젝트 상세", description: "목표 & 리스크" },
  { id: 7, title: "검토 & 출시", description: "최종 확인" },
];

const categories = [
  { value: "", label: "카테고리 선택" },
  { value: "defi", label: "DeFi" },
  { value: "nft", label: "NFT" },
  { value: "gaming", label: "게임" },
  { value: "social", label: "소셜" },
  { value: "infrastructure", label: "인프라" },
  { value: "dao", label: "DAO" },
  { value: "other", label: "기타" },
];

export default function CreateProject() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    mainImage: "",
    additionalImages: [],
    videoUrl: "",
    targetAmount: 10000,
    minimumPledge: 10,
    duration: 30,
    currency: "XRP" as const,
    creatorName: "",
    creatorBio: "",
    businessPlan: null,
    projectGoals: "",
    risks: "",
    timeline: "",
    // MPToken Configuration
    createMPToken: true,
    tokenName: "Project Token",
    tokenSymbol: "PRJ",
    tokenDescription: "Project utility token",
    totalSupply: 1000000,
    tokenDistribution: {
      investors: 60,
      team: 20,
      community: 15,
      reserves: 5,
    },
    tokenBenefits: {
      votingRights: false,
      profitSharing: false,
      specialBenefits: false,
      governance: false,
    },
  });

  const updateFormData = <K extends keyof ProjectForm>(field: K, value: ProjectForm[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createProject = async () => {
    // 필수 필드 검증
    if (!formData.creatorName.trim()) {
      toast.error('창작자 이름을 입력해주세요.');
      return;
    }
    
    if (!formData.businessPlan) {
      toast.error('사업계획서를 업로드해주세요.');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // MPToken 생성 (선택사항)
      let mptokenData = null;
      console.log('MPT 생성 체크:', formData.createMPToken);
      
      if (formData.createMPToken) {
        console.log('MPT 토큰 생성 시작...');
        try {
          // 실제 XRPL MPT 토큰 생성
          const mptRequest: CreateMPTRequest = {
            projectData: {
              id: `project_${Date.now()}`,
              title: formData.title,
              description: formData.fullDescription,
              category: formData.category,
              targetAmount: formData.targetAmount,
              website: '', // 추후 추가
              logo: formData.mainImage,
              tags: [formData.category],
              socialLinks: {
                twitter: '',
                discord: '',
                github: ''
              },
              creator: formData.creatorName,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString(),
              fundingGoal: formData.targetAmount
            },
            adminSeed: "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", // 실제 운영에서는 환경변수에서 가져와야 함
            userSeed: "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc", // 사용자 지갑이 연결되면 사용
            assetScale: 0,
            maximumAmount: formData.totalSupply.toString()
          };

          console.log('MPT 요청 데이터:', mptRequest);
          const mptResult = await createMPToken(mptRequest);
          console.log('MPT 생성 결과:', mptResult);
          
          if (mptResult.success && mptResult.data) {
            mptokenData = {
              issuanceId: mptResult.data.issuanceId,
              name: formData.tokenName,
              symbol: formData.tokenSymbol,
              description: formData.tokenDescription,
              totalSupply: formData.totalSupply,
              distribution: formData.tokenDistribution,
              benefits: formData.tokenBenefits,
              created: true,
              createdAt: new Date().toISOString(),
              metadata: mptResult.data.metadata,
              projectId: mptResult.data.projectId
            };
            
            toast.success('MPToken이 성공적으로 생성되었습니다!');
          } else {
            throw new Error(mptResult.error || 'MPT 토큰 생성 실패');
          }
        } catch (error) {
          console.error('MPToken creation failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`MPToken 생성에 실패했습니다: ${errorMessage}. 프로젝트는 생성되지만 MPToken 없이 진행됩니다.`);
        }
      }
      
      // 프로젝트 데이터 생성
      const newProject = {
        id: Date.now().toString(), // 임시 ID 생성
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.fullDescription,
        image: formData.mainImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
        creator: formData.creatorName,
        category: formData.category,
        targetAmount: formData.targetAmount,
        currentAmount: 0,
        backers: 0,
        daysLeft: formData.duration,
        status: "active" as const,
        currency: formData.currency,
        tags: [formData.category],
        createdAt: new Date().toISOString(),
        // Web3 관련 데이터
        escrowAddress: `rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH`,
        proofTokenAddress: `rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH`,
        proofTokenSymbol: `${formData.title.toUpperCase().replace(/\s+/g, '-')}-PROOF`,
        proofTokenTotal: 1000000,
        proofTokenDistributed: 0,
        paymentFee: 0.5,
        successFee: 10,
        kycVerified: true,
        smartContractVerified: true,
        escrowProtected: true,
        autoRefund: true,
        // 펀딩 히스토리 초기화
        fundingHistory: [],
        // MPToken 데이터
        mptoken: mptokenData,
        // 업데이트 초기화
        updates: [],
        // FAQ 초기화
        faqs: [],
        // 거버넌스 초기화
        governance: {
          proposals: []
        },
        // 투명성 리포트 초기화
        transparencyReports: [],
        // 사업계획서 정보
        businessPlan: {
          fileName: formData.businessPlan.name,
          fileSize: formData.businessPlan.size,
          uploadedAt: new Date().toISOString()
        }
      };

      // 로컬 스토리지에 저장 (실제로는 API 호출)
      const existingProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      existingProjects.push(newProject);
      localStorage.setItem('userProjects', JSON.stringify(existingProjects));

      toast.success("프로젝트가 성공적으로 생성되었습니다!");
      
      // 프로젝트 상세 페이지로 리다이렉트
      router.push(`/projects/${newProject.id}`);
      
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      toast.error("프로젝트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <MediaStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <FundingStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <MPTokenStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <CreatorInfoStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <ProjectDetailsStep formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-dark main-content">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}} />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">프로젝트 생성하기</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              당신의 아이디어를
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                현실로 만들어보세요
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Web3 기반의 투명하고 안전한 크라우드펀딩으로 혁신적인 프로젝트를 시작하세요
            </p>
          </div>

          {/* Stepper */}
          <Stepper steps={steps} currentStep={currentStep} />

          {/* Form Content */}
          <div className="max-w-4xl mx-auto">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <Button
                variant="secondary"
                size="lg"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>이전</span>
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                >
                  <span>다음</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  variant="neon"
                  size="lg"
                  onClick={createProject}
                  disabled={isCreating}
                  className="flex items-center space-x-2"
                >
                  <Rocket className="w-5 h-5" />
                  <span>{isCreating ? "생성 중..." : "프로젝트 출시"}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Step Components
function BasicInfoStep({ formData, updateFormData }: { formData: ProjectForm; updateFormData: (field: keyof ProjectForm, value: unknown) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">프로젝트 기본 정보</CardTitle>
            <p className="text-gray-300">프로젝트의 핵심 정보를 입력해주세요</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-white font-semibold">프로젝트 제목 *</label>
            <Input
              placeholder="혁신적인 프로젝트 이름을 입력하세요"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-semibold">카테고리 *</label>
            <Select
              options={categories}
              value={formData.category}
              onChange={(e) => updateFormData('category', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-white font-semibold">프로젝트 요약 *</label>
          <Input
            placeholder="한 줄로 프로젝트를 설명해주세요 (최대 100자)"
            value={formData.shortDescription}
            onChange={(e) => updateFormData('shortDescription', e.target.value)}
            maxLength={100}
          />
          <p className="text-gray-400 text-sm">{formData.shortDescription.length}/100</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-white font-semibold">프로젝트 상세 설명 *</label>
          <Textarea
            placeholder="프로젝트에 대해 자세히 설명해주세요. 문제점, 솔루션, 기대효과 등을 포함해주세요."
            value={formData.fullDescription}
            onChange={(e) => updateFormData('fullDescription', e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-white font-semibold">창작자 이름 *</label>
            <Input
              placeholder="창작자 또는 팀 이름"
              value={formData.creatorName}
              onChange={(e) => updateFormData('creatorName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-white font-semibold">사업계획서 업로드 *</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {formData.businessPlan ? (
                <div className="space-y-2">
                  <p className="text-white font-medium">{formData.businessPlan.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(formData.businessPlan.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFormData('businessPlan', null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    파일 제거
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-400">PDF, DOC, DOCX 파일을 업로드하세요</p>
                  <p className="text-gray-500 text-sm">최대 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size <= 10 * 1024 * 1024) {
                        updateFormData('businessPlan', file);
                      } else if (file) {
                        toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
                      }
                    }}
                    className="hidden"
                    id="business-plan-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('business-plan-upload')?.click()}
                    className="mt-2"
                  >
                    파일 선택
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-semibold">창작자 소개</label>
            <Textarea
              placeholder="창작자 또는 팀에 대해 간단히 소개해주세요"
              value={formData.creatorBio}
              onChange={(e) => updateFormData('creatorBio', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white font-semibold">투자금 통화 *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateFormData('currency', 'XRP')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.currency === 'XRP'
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-white/20 glass text-white hover:border-cyan-400/50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">XRP</div>
                <div className="text-sm text-gray-300">네이티브 토큰</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => updateFormData('currency', 'RLUSD')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.currency === 'RLUSD'
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-white/20 glass text-white hover:border-cyan-400/50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">RLUSD</div>
                <div className="text-sm text-gray-300">스테이블코인</div>
              </div>
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {formData.currency === 'XRP' 
              ? 'XRP는 XRPL의 네이티브 토큰으로, 빠른 거래와 낮은 수수료의 장점이 있습니다.'
              : 'RLUSD는 XRPL 기반 스테이블코인으로, 가격 안정성을 제공합니다.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MediaStep({ formData, updateFormData }: { formData: ProjectForm; updateFormData: (field: keyof ProjectForm, value: string | number) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
            <Image className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">미디어 & 콘텐츠</CardTitle>
            <p className="text-gray-300">프로젝트를 돋보이게 할 이미지와 영상을 추가하세요</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-white font-semibold">메인 이미지 URL *</label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={formData.mainImage}
            onChange={(e) => updateFormData('mainImage', e.target.value)}
          />
          <p className="text-gray-400 text-sm">프로젝트 카드에 표시될 대표 이미지입니다</p>
        </div>

        <div className="space-y-2">
          <label className="text-white font-semibold">프로젝트 영상 URL</label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={formData.videoUrl}
            onChange={(e) => updateFormData('videoUrl', e.target.value)}
          />
          <p className="text-gray-400 text-sm">프로젝트를 소개하는 영상 링크를 추가하세요</p>
        </div>

        {/* Image Preview */}
        {formData.mainImage && (
          <div className="space-y-2">
            <label className="text-white font-semibold">이미지 미리보기</label>
            <div className="glass rounded-xl p-4">
              <img
                src={formData.mainImage}
                alt="Project preview"
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Media Guidelines */}
        <div className="glass rounded-xl p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <Video className="w-5 h-5 text-cyan-400 mr-2" />
            미디어 가이드라인
          </h4>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• 메인 이미지: 1200x675px (16:9 비율) 권장</li>
            <li>• 파일 형식: JPG, PNG, GIF 지원</li>
            <li>• 영상: YouTube, Vimeo 링크 지원</li>
            <li>• 고품질 이미지로 프로젝트의 매력을 어필하세요</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FundingStep({ formData, updateFormData }: { formData: ProjectForm; updateFormData: (field: keyof ProjectForm, value: string | number) => void }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">펀딩 설정</CardTitle>
              <p className="text-gray-300">목표 금액과 펀딩 기간을 설정하세요</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white font-semibold">목표 금액 ({formData.currency}) *</label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.targetAmount}
                onChange={(e) => updateFormData('targetAmount', Number(e.target.value))}
                min="100"
              />
              <p className="text-gray-400 text-sm">최소 100 {formData.currency} 이상</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-white font-semibold">최소 후원 금액 ({formData.currency}) *</label>
              <Input
                type="number"
                placeholder="10"
                value={formData.minimumPledge}
                onChange={(e) => updateFormData('minimumPledge', Number(e.target.value))}
                min="1"
              />
              <p className="text-gray-400 text-sm">후원자가 투자할 수 있는 최소 금액</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-semibold">펀딩 기간 (일) *</label>
            <Select
              options={[
                { value: "7", label: "7일" },
                { value: "14", label: "14일" },
                { value: "21", label: "21일" },
                { value: "30", label: "30일" },
                { value: "45", label: "45일" },
                { value: "60", label: "60일" },
              ]}
              value={formData.duration.toString()}
              onChange={(e) => updateFormData('duration', Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-white font-semibold">프로젝트 목표</label>
              <Textarea
                placeholder="이 펀딩으로 달성하고자 하는 구체적인 목표를 설명하세요"
                value={formData.projectGoals}
                onChange={(e) => updateFormData('projectGoals', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white font-semibold">리스크 & 대응방안</label>
              <Textarea
                placeholder="프로젝트 진행 중 발생할 수 있는 리스크와 대응방안을 설명하세요"
                value={formData.risks}
                onChange={(e) => updateFormData('risks', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-semibold">개발 일정</label>
            <Textarea
              placeholder="프로젝트 개발 및 진행 일정을 단계별로 설명하세요"
              value={formData.timeline}
              onChange={(e) => updateFormData('timeline', e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <FeeStructureCard 
        targetAmount={formData.targetAmount} 
        estimatedAmount={formData.targetAmount * 1.5} // 150% 가정
        currency={formData.currency}
      />
    </div>
  );
}

function ReviewStep({ formData }: { formData: ProjectForm }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">프로젝트 검토</CardTitle>
              <p className="text-gray-300">입력하신 정보를 최종 확인해주세요</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Project Preview Card */}
          <div className="glass rounded-2xl overflow-hidden">
            {formData.mainImage && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={formData.mainImage}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{formData.title}</h3>
                <span className="text-cyan-400 font-semibold">{formData.category}</span>
              </div>
              
              <p className="text-gray-300">{formData.shortDescription}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{formData.targetAmount.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">목표 금액 (RLUSD)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{formData.minimumPledge}</div>
                  <div className="text-gray-400 text-sm">최소 후원 (RLUSD)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">{formData.duration}</div>
                  <div className="text-gray-400 text-sm">펀딩 기간 (일)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{formData.creatorName}</div>
                  <div className="text-gray-400 text-sm">창작자</div>
                </div>
              </div>
              
              {/* MPToken 정보 표시 */}
              {formData.createMPToken && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h4 className="text-lg font-semibold text-white">MPToken 정보</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">토큰 이름:</span>
                      <span className="text-white ml-2">{formData.tokenName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">토큰 심볼:</span>
                      <span className="text-white ml-2">{formData.tokenSymbol}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">총 발행량:</span>
                      <span className="text-white ml-2">{formData.totalSupply.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">배분 계획:</span>
                      <span className="text-white ml-2">
                        투자자 {formData.tokenDistribution.investors}%, 팀 {formData.tokenDistribution.team}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Checklist */}
          <div className="glass rounded-xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 text-cyan-400 mr-2" />
              출시 전 체크리스트
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-300">프로젝트 정보가 정확하게 입력되었습니다</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-300">수수료 구조를 확인했습니다</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-300">지갑이 연결되어 있습니다</span>
              </div>
              {formData.createMPToken && (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-300">MPToken 설정이 완료되었습니다</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Creator Info Step Component
const CreatorInfoStep = ({ formData, updateFormData }: { formData: ProjectForm; updateFormData: (field: keyof ProjectForm, value: unknown) => void }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">창작자 정보</h2>
        <p className="text-gray-400">프로젝트 창작자 정보와 사업계획서를 입력해주세요</p>
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">창작자 이름 *</label>
              <Input
                value={formData.creatorName}
                onChange={(e) => updateFormData('creatorName', e.target.value)}
                placeholder="창작자 이름을 입력해주세요"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">창작자 소개</label>
              <Textarea
                value={formData.creatorBio}
                onChange={(e) => updateFormData('creatorBio', e.target.value)}
                placeholder="창작자에 대한 소개를 작성해주세요"
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">사업계획서 *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-300">
                    <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none">
                      <span>파일 업로드</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => updateFormData('businessPlan', e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX 파일만 업로드 가능</p>
                </div>
              </div>
              {formData.businessPlan && (
                <div className="mt-2 text-sm text-green-400">
                  ✓ {formData.businessPlan.name} 업로드 완료
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Project Details Step Component
const ProjectDetailsStep = ({ formData, updateFormData }: { formData: ProjectForm; updateFormData: (field: keyof ProjectForm, value: unknown) => void }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">프로젝트 상세</h2>
        <p className="text-gray-400">프로젝트의 목표, 리스크, 타임라인을 상세히 설명해주세요</p>
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 목표</label>
              <Textarea
                value={formData.projectGoals}
                onChange={(e) => updateFormData('projectGoals', e.target.value)}
                placeholder="프로젝트의 구체적인 목표와 달성하고자 하는 결과를 설명해주세요"
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">리스크 및 도전과제</label>
              <Textarea
                value={formData.risks}
                onChange={(e) => updateFormData('risks', e.target.value)}
                placeholder="프로젝트 진행 중 예상되는 리스크와 도전과제를 설명해주세요"
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 타임라인</label>
              <Textarea
                value={formData.timeline}
                onChange={(e) => updateFormData('timeline', e.target.value)}
                placeholder="프로젝트의 주요 마일스톤과 일정을 설명해주세요"
                rows={4}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// MPToken Configuration Step Component
const MPTokenStep = ({ formData, updateFormData }: { formData: ProjectForm; updateFormData: (field: keyof ProjectForm, value: unknown) => void }) => {
  const [distributionTotal, setDistributionTotal] = useState(100);

  const updateDistribution = (field: keyof typeof formData.tokenDistribution, value: number) => {
    const newDistribution = { ...formData.tokenDistribution, [field]: value };
    updateFormData('tokenDistribution', newDistribution);
    
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    setDistributionTotal(total);
  };

  const updateBenefit = (field: keyof typeof formData.tokenBenefits, value: boolean) => {
    updateFormData('tokenBenefits', { ...formData.tokenBenefits, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">MPToken 설정</h2>
        <p className="text-gray-400">프로젝트 전용 토큰을 생성하여 투자자들에게 특별한 혜택을 제공하세요</p>
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* MPToken 생성 여부 */}
            <div className="flex items-center justify-between p-4 border border-purple-500/20 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-white">MPToken 생성</h3>
                <p className="text-gray-400 text-sm">프로젝트 전용 토큰을 생성하시겠습니까?</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createMPToken}
                  onChange={(e) => updateFormData('createMPToken', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {formData.createMPToken && (
              <>
                {/* 토큰 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">토큰 이름</label>
                    <Input
                      value={formData.tokenName}
                      onChange={(e) => updateFormData('tokenName', e.target.value)}
                      placeholder="예: ProjectCoin"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">토큰 심볼</label>
                    <Input
                      value={formData.tokenSymbol}
                      onChange={(e) => updateFormData('tokenSymbol', e.target.value)}
                      placeholder="예: PRJ"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">토큰 설명</label>
                  <Textarea
                    value={formData.tokenDescription}
                    onChange={(e) => updateFormData('tokenDescription', e.target.value)}
                    placeholder="토큰의 용도와 혜택을 설명해주세요"
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">총 발행량</label>
                  <Input
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) => updateFormData('totalSupply', parseInt(e.target.value) || 0)}
                    placeholder="1000000"
                    className="w-full"
                  />
                </div>

                {/* 토큰 배분 */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">토큰 배분 계획</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">투자자 (%)</label>
                      <Input
                        type="number"
                        value={formData.tokenDistribution.investors}
                        onChange={(e) => updateDistribution('investors', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">팀 (%)</label>
                      <Input
                        type="number"
                        value={formData.tokenDistribution.team}
                        onChange={(e) => updateDistribution('team', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">커뮤니티 (%)</label>
                      <Input
                        type="number"
                        value={formData.tokenDistribution.community}
                        onChange={(e) => updateDistribution('community', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">준비금 (%)</label>
                      <Input
                        type="number"
                        value={formData.tokenDistribution.reserves}
                        onChange={(e) => updateDistribution('reserves', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${distributionTotal === 100 ? 'text-green-400' : 'text-red-400'}`}>
                      총 배분: {distributionTotal}%
                    </span>
                    {distributionTotal !== 100 && (
                      <span className="text-red-400 ml-2">(100%가 되어야 합니다)</span>
                    )}
                  </div>
                </div>

                {/* 토큰 혜택 */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">토큰 혜택</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tokenBenefits.votingRights}
                        onChange={(e) => updateBenefit('votingRights', e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-white font-medium">투표권</div>
                        <div className="text-gray-400 text-sm">프로젝트 의사결정에 참여</div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tokenBenefits.profitSharing}
                        onChange={(e) => updateBenefit('profitSharing', e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-white font-medium">수익 분배</div>
                        <div className="text-gray-400 text-sm">프로젝트 수익의 일정 부분</div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tokenBenefits.specialBenefits}
                        onChange={(e) => updateBenefit('specialBenefits', e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-white font-medium">특별 혜택</div>
                        <div className="text-gray-400 text-sm">완성품 우선 구매권 등</div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tokenBenefits.governance}
                        onChange={(e) => updateBenefit('governance', e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-white font-medium">거버넌스</div>
                        <div className="text-gray-400 text-sm">프로젝트 방향성 제안권</div>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
