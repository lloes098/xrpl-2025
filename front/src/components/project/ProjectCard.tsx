import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Calendar, Target, Users, TrendingUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    image: string;
    creator: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    backers: number;
    daysLeft: number;
    status: "active" | "successful" | "ended" | "failed";
    currency: "XRP" | "RLUSD";
  };
  onDelete?: (projectId: string) => void;
  isUserProject?: boolean;
}

export function ProjectCard({ project, onDelete, isUserProject = false }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const progressPercentage = (project.currentAmount / project.targetAmount) * 100;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      if (onDelete) {
        onDelete(project.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (project.status) {
      case "active":
        return <Badge variant="success">진행중</Badge>;
      case "successful":
        return <Badge variant="info">성공</Badge>;
      case "ended":
        return <Badge variant="destructive">종료</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="default">알 수 없음</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <Card className="group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            {getStatusBadge()}
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="secondary" className="glass border-white/20 text-white">{project.category}</Badge>
            {isUserProject && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors text-white">
          {project.title}
        </CardTitle>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>
        
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white neon-text">
                {formatAmount(project.currentAmount)} {project.currency}
              </span>
              <span className="text-gray-400">
                목표: {formatAmount(project.targetAmount)} {project.currency}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 neon-glow"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="text-sm text-cyan-400 font-medium">
              {progressPercentage.toFixed(1)}% 달성
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{project.backers}명 후원</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>{project.daysLeft}일 남음</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col space-y-3">
        <div className="flex items-center justify-between w-full text-sm">
          <span className="text-gray-400">창작자</span>
          <span className="font-medium text-white">{project.creator}</span>
        </div>
        
        <Link href={`/projects/${project.id}`} className="w-full">
          <Button variant="primary" className="w-full group-hover:scale-105 transition-transform">
            <Target className="w-4 h-4 mr-2" />
            프로젝트 보기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
