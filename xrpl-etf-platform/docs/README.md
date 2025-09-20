# XRPL ETF Platform Documentation

## 프로젝트 개요
XRPL 블록체인을 기반으로 한 ETF(Exchange Traded Fund) 거래 플랫폼

## 주요 기능
- [ ] XRPL 지갑 연동
- [ ] ETF 토큰 생성 및 관리
- [ ] 실시간 포트폴리오 추적
- [ ] ETF 토큰 거래 (구매/판매)
- [ ] 포트폴리오 분석 대시보드

## 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Blockchain**: XRPL, XRPL Hooks
- **Database**: PostgreSQL
- **DevOps**: Docker, Kubernetes (optional)

## API 설계

### 인증
- POST `/api/auth/login` - 지갑 연결 로그인
- POST `/api/auth/logout` - 로그아웃

### ETF 관련
- GET `/api/etf` - ETF 목록 조회
- GET `/api/etf/:id` - 특정 ETF 상세 정보
- POST `/api/etf` - 새 ETF 생성 (관리자)
- PUT `/api/etf/:id` - ETF 정보 업데이트

### 거래
- POST `/api/trade/buy` - ETF 토큰 구매
- POST `/api/trade/sell` - ETF 토큰 판매
- GET `/api/trade/history` - 거래 내역

### 포트폴리오
- GET `/api/portfolio` - 사용자 포트폴리오
- GET `/api/portfolio/analytics` - 포트폴리오 분석

## 개발 가이드

### 환경 설정
1. Node.js 18+ 설치
2. pnpm 설치
3. PostgreSQL 설치 및 설정
4. 환경 변수 설정 (.env.example 참고)

### 로컬 개발
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 테스트
pnpm test
```

## 배포

### Docker
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f infra/k8s/
```
