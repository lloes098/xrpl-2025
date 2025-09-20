# XRPL ETF Platform

XRPL 기반 ETF(Exchange Traded Fund) 플랫폼

## 프로젝트 구조

```
xrpl-etf-platform/
├── apps/                          # 실행되는 앱들
│   ├── web/                       # 프론트엔드 (Next.js 14, App Router)
│   └── api/                       # 백엔드 (Express/FastAPI/Django 중 선택)
│
├── contracts/                     # XRPL Hooks / 스마트컨트랙트 관련 코드
│   ├── hooks/                     # XRPL Hooks C 코드
│   ├── tests/                     # hook 테스트 (XRPL Local devnet 기반)
│   └── scripts/                   # 배포/빌드 스크립트
│
├── packages/                      # 공용 패키지
│   ├── ui/                        # 공통 UI 컴포넌트 (버튼, 카드, 대시보드 위젯 등)
│   ├── utils/                     # JS/TS 유틸 함수 (api fetcher, math, formatter 등)
│   ├── xrpl-sdk/                  # XRPL 클라이언트 래퍼 (XRP 송금, Escrow, PaymentChannel 호출)
│   └── types/                     # 공용 타입 정의 (TypeScript interface, DTO 등)
│
├── infra/                         # 인프라 관련
│   ├── docker/                    # Dockerfile, docker-compose
│   ├── k8s/                       # (옵션) 쿠버네티스 배포 yaml
│   └── db/                        # 초기 schema, 마이그레이션
│
├── docs/                          # 프로젝트 문서 (회의록, API 스펙, 기능 정의)
│
├── .env                           # 공용 환경변수
├── pnpm-workspace.yaml            # pnpm 모노레포 설정
├── turbo.json                     # turborepo 파이프라인 설정
├── package.json                   
└── README.md
```

## 시작하기

### 전제조건
- Node.js 18+
- pnpm
- Docker (옵션)

### 설치
```bash
pnpm install
```

### 개발 서버 실행
```bash
pnpm dev
```

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Blockchain**: XRPL Hooks, XRPL.js
- **Database**: PostgreSQL
- **Tools**: pnpm, Turborepo, Docker
