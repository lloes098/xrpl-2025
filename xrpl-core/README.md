# XRPL Core

XRPL Core는 분산 투자 플랫폼을 위한 핵심 서비스 라이브러리입니다. XRPL(XRP Ledger)을 기반으로 한 투자, 토큰화, 에스크로 등의 기능을 제공합니다.

## 🚀 주요 기능

- **프로젝트 관리**: 투자 프로젝트의 전체 라이프사이클 관리
- **MPT 토큰**: Multi-Purpose Token을 통한 프로젝트 토큰화
- **에스크로 시스템**: 마일스톤 기반 조건부 자금 관리
- **배치 트랜잭션**: 복합 거래의 원자적 실행
- **펀딩 관리**: 투자 프로세스 및 수익 분배 관리
- **이벤트 시스템**: 실시간 이벤트 처리 및 알림

## 📁 프로젝트 구조

```
xrpl-core/
├── src/
│   ├── config/                 # 설정 파일
│   ├── services/              # 핵심 서비스
│   │   ├── wallet/           # 지갑 관리
│   │   ├── mpt/              # MPT 토큰 관리
│   │   ├── escrow/           # 에스크로 관리
│   │   ├── batch/            # 배치 트랜잭션
│   │   ├── project/          # 프로젝트 관리
│   │   └── funding/          # 펀딩 관리
│   ├── models/               # 데이터 모델
│   ├── utils/                # 유틸리티 함수
│   ├── api/                  # API 라우트
│   └── events/               # 이벤트 시스템
├── tests/                    # 테스트 파일
├── docs/                     # 문서
└── package.json
```

## 🛠 설치 및 설정

### 요구사항

- Node.js >= 16.0.0
- npm >= 8.0.0

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# XRPL 설정
XRPL_NETWORK=testnet
XRPL_SERVER=wss://s.altnet.rippletest.net:51233

# 플랫폼 설정
PLATFORM_MASTER_SEED=your_master_seed_here
PLATFORM_FEE_PERCENTAGE=0.05

# JWT 설정
JWT_SECRET=your_jwt_secret_here

# 데이터베이스 설정 (선택사항)
DATABASE_URL=your_database_url_here
```

## 🚀 사용법

### 기본 사용법

```javascript
const { ServiceContainer } = require('./src/services/ServiceContainer');

async function initializeServices() {
  const container = new ServiceContainer();
  
  await container.initialize({
    xrpl: {
      networkUrl: 'wss://s.altnet.rippletest.net:51233'
    },
    platform: {
      masterSeed: process.env.PLATFORM_MASTER_SEED
    }
  });

  return container;
}
```

### 프로젝트 생성

```javascript
const projectManager = container.getService('projectManager');

const project = await projectManager.createProject({
  name: 'My Project',
  description: 'A great project',
  targetAmount: 100000,
  deadline: new Date('2024-12-31'),
  creatorWallet: wallet,
  milestones: [
    {
      name: 'MVP Development',
      description: 'Minimum Viable Product',
      targetDate: new Date('2024-06-30'),
      rewardPercentage: 30
    }
  ]
});
```

### 투자 처리

```javascript
const fundingManager = container.getService('fundingManager');

const investment = await fundingManager.processInvestment({
  projectId: project.id,
  investorWallet: investorWallet,
  rlusdAmount: 5000
});
```

### MPT 토큰 생성

```javascript
const mptManager = container.getService('mptManager');

const mptToken = await mptManager.createProjectMPT({
  projectId: project.id,
  name: 'My Project Token',
  description: 'Token for My Project',
  totalTokens: 1000000,
  targetAmount: 100000
});
```

## 🧪 테스트

### 전체 테스트 실행

```bash
npm test
```

### 단위 테스트

```bash
npm run test:unit
```

### 통합 테스트

```bash
npm run test:integration
```

### E2E 테스트

```bash
npm run test:e2e
```

### 커버리지 리포트

```bash
npm run test:coverage
```

## 📚 API 문서

### 프로젝트 API

- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects` - 프로젝트 목록 조회
- `GET /api/projects/:id` - 특정 프로젝트 조회
- `PUT /api/projects/:id` - 프로젝트 업데이트
- `DELETE /api/projects/:id` - 프로젝트 삭제

### 투자 API

- `POST /api/investments` - 투자 처리
- `GET /api/investments` - 투자 목록 조회
- `GET /api/investments/:id` - 특정 투자 조회
- `POST /api/investments/:id/confirm` - 투자 확인
- `POST /api/investments/:id/refund` - 투자 환불

### 토큰 API

- `POST /api/tokens/mpt` - MPT 토큰 생성
- `GET /api/tokens/mpt` - MPT 토큰 목록 조회
- `POST /api/tokens/mpt/:id/mint` - 토큰 발행
- `POST /api/tokens/mpt/:id/transfer` - 토큰 전송

### 에스크로 API

- `POST /api/escrows` - 에스크로 생성
- `GET /api/escrows` - 에스크로 목록 조회
- `POST /api/escrows/:id/finish` - 에스크로 완료
- `POST /api/escrows/:id/cancel` - 에스크로 취소

## 🔧 개발

### 개발 서버 실행

```bash
npm run dev
```

### 코드 린팅

```bash
npm run lint
```

### 코드 린팅 자동 수정

```bash
npm run lint:fix
```

### 빌드

```bash
npm run build
```

## 📖 문서 생성

```bash
npm run docs
```

생성된 문서는 `docs/` 폴더에서 확인할 수 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 지원

문제가 발생하거나 질문이 있으시면 다음을 통해 연락해 주세요:

- Issues: [GitHub Issues](https://github.com/your-org/xrpl-core/issues)
- Email: support@xrpl-core.com
- Documentation: [https://docs.xrpl-core.com](https://docs.xrpl-core.com)

## 🙏 감사의 말

이 프로젝트는 XRPL 커뮤니티와 오픈소스 기여자들의 도움으로 만들어졌습니다.

---

**XRPL Core** - 분산 투자 플랫폼의 핵심
