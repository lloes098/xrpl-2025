# Ripplize - XRPL 기반 크라우드펀딩 플랫폼

XRPL (XRP Ledger) 기반의 탈중앙화 크라우드펀딩 플랫폼으로, Web3 프로젝트의 투명하고 안전한 펀딩을 지원합니다.

## 🚀 주요 기능

### 프로젝트 관리
- **프로젝트 생성**: Web3 프로젝트 등록 및 관리
- **투명한 펀딩**: 블록체인 기반의 투명한 자금 관리
- **실시간 진행률**: 실시간 펀딩 현황 및 통계

### MPT (Multi-Purpose Token) 통합
- **토큰 발행**: 프로젝트별 MPT 토큰 생성
- **에스크로 시스템**: 안전한 자금 보관 및 관리
- **권한 관리**: Can Transfer, Can Escrow, Can Trade, Can Lock 등 세밀한 권한 제어

### 에스크로 관리
- **에스크로 생성**: 목표 달성 시 자동 자금 해제
- **조건부 해제**: 시간 기반 또는 조건 기반 자금 해제
- **취소 기능**: 프로젝트 실패 시 자금 환불

## 🏗️ 프로젝트 구조

```
final/
├── front/                    # Next.js 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── api/         # API 라우트
│   │   │   │   ├── mpt/     # MPT 관련 API
│   │   │   │   └── escrow/  # 에스크로 관련 API
│   │   │   ├── projects/    # 프로젝트 페이지
│   │   │   └── create/      # 프로젝트 생성 페이지
│   │   ├── components/      # React 컴포넌트
│   │   └── lib/            # 유틸리티 및 API 클라이언트
│   └── package.json
└── xrpl-core/              # XRPL 코어 서비스
    ├── src/
    │   ├── services/
    │   │   ├── mpt/        # MPT 토큰 관리
    │   │   └── escrow/     # 에스크로 관리
    │   └── api/            # Express API 서버
    └── package.json
```

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 15.5.3**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Radix UI**: 접근성 우선 UI 컴포넌트
- **Zustand**: 상태 관리

### 백엔드
- **XRPL (XRP Ledger)**: 블록체인 네트워크
- **MPT (Multi-Purpose Token)**: 멀티 퍼포즈 토큰
- **Escrow**: 조건부 자금 보관 시스템
- **Express.js**: API 서버

### 개발 도구
- **Turbopack**: Next.js 번들러
- **ESLint**: 코드 품질 관리
- **TypeScript**: 정적 타입 검사

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/lloes098/xrpl-2025.git
cd xrpl-2025/final
```

### 2. 의존성 설치
```bash
# 프론트엔드 의존성 설치
cd front
npm install

# XRPL 코어 의존성 설치
cd ../xrpl-core
npm install
```

### 3. 환경 변수 설정
```bash
# front/.env.local 파일 생성
NEXT_PUBLIC_XRPL_NETWORK=wss://s.devnet.rippletest.net:51233
```

### 4. 개발 서버 실행
```bash
# 프론트엔드 개발 서버 실행
cd front
npm run dev

# XRPL 코어 서버 실행 (별도 터미널)
cd xrpl-core
npm run dev
```

## 📱 사용법

### 프로젝트 생성
1. `/create` 페이지에서 프로젝트 정보 입력
2. MPT 토큰 설정 (선택사항)
3. 프로젝트 등록 및 MPT 토큰 발행

### 에스크로 관리
1. 프로젝트 상세 페이지에서 "에스크로 생성" 클릭
2. 에스크로 조건 설정 (해제 시간, 취소 시간)
3. 자금 보관 및 조건부 해제

### MPT 토큰 관리
- **발행**: 프로젝트 생성 시 MPT 토큰 발행
- **권한 설정**: Transfer, Escrow, Trade, Lock 권한 관리
- **생명주기**: Activate → Distribute → Complete/Cancel

## 🔧 API 엔드포인트

### MPT 관련
- `POST /api/mpt/create` - MPT 토큰 생성
- `GET /api/mpt/info` - MPT 토큰 정보 조회

### 에스크로 관련
- `POST /api/escrow/create` - 에스크로 생성
- `POST /api/escrow/finish` - 에스크로 해제
- `POST /api/escrow/cancel` - 에스크로 취소
- `GET /api/escrow/info` - 에스크로 정보 조회

## 🌐 네트워크

- **개발 환경**: XRPL Devnet
- **테스트 XRP**: [Devnet Faucet](https://xrpl.org/xrp-testnet-faucet.html)에서 무료 XRP 획득 가능

## 🔐 보안

- **지갑 관리**: 시드 기반 지갑 생성 및 관리
- **트랜잭션 서명**: 모든 트랜잭션은 개인키로 서명
- **권한 제어**: MPT 토큰별 세밀한 권한 관리

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Ripplize** - Web3의 미래를 함께 만들어가세요! 🚀