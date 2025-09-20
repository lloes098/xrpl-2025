"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  description: string;
}

interface MonthlyExpense {
  month: string;
  development: number;
  marketing: number;
  operations: number;
  other: number;
}

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff', '#f3e8ff'];

interface TransparencyChartProps {
  projectId?: string;
}

export function TransparencyChart({ projectId }: TransparencyChartProps) {
  // 프로젝트 데이터 가져오기
  const allProjects = [
    ...(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userProjects') || '[]') : [])
  ];
  
  // 프로젝트 ID로 해당 프로젝트 찾기
  const project = allProjects.find(p => p.id === projectId);
  const totalAmount = project ? project.currentAmount : 100000; // 프로젝트의 현재 펀딩 금액

  // 투자금 사용 내역 데이터 (동적 계산)
  const getExpenseData = (): ExpenseData[] => {
    
    return [
      {
        category: '개발비',
        amount: Math.floor(totalAmount * 0.45),
        percentage: 45,
        color: '#8b5cf6',
        description: '프론트엔드, 백엔드, 블록체인 개발'
      },
      {
        category: '마케팅',
        amount: Math.floor(totalAmount * 0.25),
        percentage: 25,
        color: '#a855f7',
        description: '온라인 광고, 홍보, 콘텐츠 제작'
      },
      {
        category: '운영비',
        amount: Math.floor(totalAmount * 0.15),
        percentage: 15,
        color: '#c084fc',
        description: '서버, 도메인, 인프라 비용'
      },
      {
        category: '기타',
        amount: Math.floor(totalAmount * 0.15),
        percentage: 15,
        color: '#e9d5ff',
        description: '법무, 회계, 기타 비용'
      }
    ];
  };

  const expenseData = getExpenseData();

  // 월별 지출 데이터 (동적 계산)
  const getMonthlyData = (): MonthlyExpense[] => {
    // 총 금액을 3개월로 나누어 월별 데이터 생성
    const monthlyTotal = totalAmount / 3;
    
    return [
      { 
        month: '1월', 
        development: Math.floor(monthlyTotal * 0.45), 
        marketing: Math.floor(monthlyTotal * 0.25), 
        operations: Math.floor(monthlyTotal * 0.15), 
        other: Math.floor(monthlyTotal * 0.15) 
      },
      { 
        month: '2월', 
        development: Math.floor(monthlyTotal * 0.5), 
        marketing: Math.floor(monthlyTotal * 0.2), 
        operations: Math.floor(monthlyTotal * 0.15), 
        other: Math.floor(monthlyTotal * 0.15) 
      },
      { 
        month: '3월', 
        development: Math.floor(monthlyTotal * 0.4), 
        marketing: Math.floor(monthlyTotal * 0.3), 
        operations: Math.floor(monthlyTotal * 0.15), 
        other: Math.floor(monthlyTotal * 0.15) 
      },
    ];
  };

  const monthlyData = getMonthlyData();

  return (
    <div className="space-y-6">
      {/* 총 투자금 요약 */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            투자금 사용 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                ${totalAmount.toLocaleString()}
              </div>
              <div className="text-gray-400">총 사용 금액</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                100%
              </div>
              <div className="text-gray-400">투명도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                3개월
              </div>
              <div className="text-gray-400">추적 기간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 지출 파이 차트 */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            카테고리별 지출 비율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '금액']}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {expenseData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-4 glass rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="text-white font-semibold">{item.category}</div>
                      <div className="text-gray-400 text-sm">{item.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${item.amount.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 월별 지출 추이 */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            월별 지출 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255, 255, 255, 0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.6)"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`, 
                    name === 'development' ? '개발비' :
                    name === 'marketing' ? '마케팅' :
                    name === 'operations' ? '운영비' : '기타'
                  ]}
                />
                <Legend 
                  formatter={(value) => 
                    value === 'development' ? '개발비' :
                    value === 'marketing' ? '마케팅' :
                    value === 'operations' ? '운영비' : '기타'
                  }
                />
                <Bar dataKey="development" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="marketing" stackId="a" fill="#a855f7" />
                <Bar dataKey="operations" stackId="a" fill="#c084fc" />
                <Bar dataKey="other" stackId="a" fill="#e9d5ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 투명성 리포트 */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            투명성 리포트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 glass rounded-lg">
              <h4 className="text-white font-semibold mb-2">마케팅 비용 지출</h4>
              <p className="text-gray-300 text-sm mb-3">온라인 광고 및 홍보 비용</p>
              <div className="text-xs text-gray-400">
                <span>마케팅 • 2024-01-10</span>
              </div>
            </div>
            <div className="p-4 glass rounded-lg">
              <h4 className="text-white font-semibold mb-2">개발비 지출</h4>
              <p className="text-gray-300 text-sm mb-3">초기 개발 비용</p>
              <div className="text-xs text-gray-400">
                <span>개발 • 2024-01-15</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
