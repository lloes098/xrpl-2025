/**
 * Jest 테스트 설정 파일
 */

// 테스트 환경 설정
process.env.NODE_ENV = 'test';

// 글로벌 테스트 설정
global.testTimeout = 30000;

// 테스트 전후 처리
beforeAll(async () => {
  console.log('Setting up test environment...');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
});

// 각 테스트 전후 처리
beforeEach(() => {
  // 테스트 전 초기화
});

afterEach(() => {
  // 테스트 후 정리
});

// 모킹 설정
jest.mock('xrpl', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    request: jest.fn().mockResolvedValue({ result: {} }),
    submitAndWait: jest.fn().mockResolvedValue({ result: { hash: 'test_hash' } })
  })),
  Wallet: {
    generate: jest.fn().mockReturnValue({
      address: 'test_address',
      publicKey: 'test_public_key',
      privateKey: 'test_private_key',
      sign: jest.fn().mockReturnValue({ tx_blob: 'signed_tx' })
    }),
    fromSeed: jest.fn().mockReturnValue({
      address: 'test_address',
      publicKey: 'test_public_key',
      privateKey: 'test_private_key',
      sign: jest.fn().mockReturnValue({ tx_blob: 'signed_tx' })
    })
  },
  isValidAddress: jest.fn().mockReturnValue(true),
  isValidSeed: jest.fn().mockReturnValue(true),
  xrpToDrops: jest.fn().mockReturnValue('1000000'),
  dropsToXrp: jest.fn().mockReturnValue('1')
}));

// 테스트 유틸리티 함수
global.createMockProject = () => ({
  id: 'test_project_id',
  name: 'Test Project',
  description: 'A test project',
  targetAmount: 100000,
  currentAmount: 0,
  deadline: new Date('2024-12-31'),
  creatorWallet: 'rTestCreator...',
  status: 'ACTIVE',
  createdAt: new Date()
});

global.createMockInvestment = () => ({
  id: 'test_investment_id',
  projectId: 'test_project_id',
  investorAddress: 'rTestInvestor...',
  rlusdAmount: 5000,
  tokenAmount: 500000,
  status: 'CONFIRMED',
  createdAt: new Date()
});

global.createMockMPTToken = () => ({
  projectId: 'test_project_id',
  mptIssuanceId: 'mpt_test_1234567890abcdef',
  name: 'Test Token',
  symbol: 'TEST',
  totalSupply: 1000000,
  circulatingSupply: 0,
  isActive: true,
  createdAt: new Date()
});

global.createMockEscrow = () => ({
  escrowSequence: 'escrow_test_1234567890abcdef',
  projectId: 'test_project_id',
  investorAddress: 'rTestInvestor...',
  projectWallet: 'rTestProject...',
  tokenAmount: 100000,
  rlusdAmount: 1000,
  status: 'ACTIVE',
  deadline: new Date('2024-12-31'),
  createdAt: new Date()
});

// 비동기 테스트 헬퍼
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 에러 테스트 헬퍼
global.expectToThrow = async (fn, errorMessage) => {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    if (errorMessage) {
      expect(error.message).toContain(errorMessage);
    }
  }
};
