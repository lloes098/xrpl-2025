import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Card, CardContent } from "@/components/ui/Card";
import { TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Copy } from "lucide-react";

function Copyable({ value, short = 10 }: { value: string; short?: number }) {
  const display =
    value.length > short * 2
      ? `${value.slice(0, short)}…${value.slice(-short)}`
      : value;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  };
  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-purple-300 break-all">{display}</code>
      <Button variant="ghost" size="icon" onClick={onCopy} aria-label="copy">
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface Project {
  description?: string;
  escrowAddress?: string;
  proofTokenSymbol?: string;
}

export default function OverviewTab({ project }: { project: Project }) {
  return (
    <TabsContent value="overview" className="pt-6">
      {/* 프로젝트 소개 */}
        <Card className="glass mb-8">
          <CardContent className="pt-10 pb-8 px-8">
            <h2 className="text-2xl font-bold text-white mb-6">프로젝트 소개</h2>
          <div 
            className="prose prose-invert prose-ul:my-4 prose-li:marker:text-gray-400 prose-li:my-2 prose-headings:mt-0 prose-headings:mb-4 max-w-none text-gray-200"
            dangerouslySetInnerHTML={{ 
              __html: project.description ?? "_설명이 제공되지 않았습니다._" 
            }}
          />
        </CardContent>
      </Card>

      {/* XRPL Integration Info */}
      <Card className="glass mb-8">
        <CardContent className="pt-10 pb-8 px-8">
          <h3 className="text-2xl font-bold text-white mb-6">XRPL 연동 정보</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-lg bg-white/5 border border-white/10 p-6">
              <dt className="text-sm font-medium text-gray-400 mb-3">Escrow 주소</dt>
              <dd>
                <Copyable value={project.escrowAddress ?? "-"} />
              </dd>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-6">
              <dt className="text-sm font-medium text-gray-400 mb-3">Proof Token</dt>
              <dd>
                <code className="font-mono text-purple-300">
                  {project.proofTokenSymbol ?? "-"}
                </code>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
