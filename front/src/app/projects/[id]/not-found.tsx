import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-dark main-content flex items-center justify-center">
      <Header />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">프로젝트를 찾을 수 없습니다</h1>
        <p className="text-gray-300 mb-6">요청하신 프로젝트가 존재하지 않습니다.</p>
        <Link href="/projects">
          <Button variant="primary">프로젝트 목록으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
