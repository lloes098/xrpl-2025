# XRPL 송금 예제

이 프로젝트는 XRP Ledger (XRPL)를 사용하여 XRP를 송금하는 TypeScript 예제입니다.

## 환경 설정

### 1. Node.js 설치
- Node.js 16 이상 버전이 필요합니다.
- [Node.js 공식 사이트](https://nodejs.org/)에서 다운로드하세요.

### 2. 의존성 설치
```bash
npm install
```

### 3. TypeScript 컴파일 (선택사항)
```bash
npm run build
```

## 사용 방법

### 1. Testnet 계정 준비
1. [XRPL Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html)에서 테스트 XRP를 받으세요.
2. 송금자 계정의 seed를 안전하게 보관하세요.

### 2. 코드 실행
```bash
# TypeScript로 직접 실행
npm run dev

# 또는 컴파일 후 실행
npm run build
npm start

# 예제 실행
npm run test
```

### 3. 코드 수정
`example.ts` 파일에서 다음 값들을 실제 값으로 교체하세요:
- `senderSeed`: 송금자 계정의 seed (s로 시작)
- `receiverAddr`: 수신자 계정의 주소 (r로 시작)
- `amountXRP`: 송금할 XRP 양

## 주의사항

- 이 코드는 **Testnet**에서만 사용하세요.
- 실제 seed와 개인키를 코드에 하드코딩하지 마세요.
- 프로덕션 환경에서는 환경변수나 안전한 설정 파일을 사용하세요.

## 파일 구조

- `pay.ts`: XRPL 송금 함수
- `example.ts`: 사용 예제
- `package.json`: 프로젝트 설정 및 의존성
- `tsconfig.json`: TypeScript 설정

## 문제 해결

### 계정이 활성화되지 않은 경우
Testnet Faucet에서 충분한 XRP를 받았는지 확인하세요.

### 네트워크 연결 오류
인터넷 연결을 확인하고 XRPL Testnet 서버 상태를 확인하세요.

### 트랜잭션 실패
- 계정 잔액이 충분한지 확인
- 수신자 주소가 올바른지 확인
- 네트워크 수수료를 고려한 충분한 잔액이 있는지 확인
