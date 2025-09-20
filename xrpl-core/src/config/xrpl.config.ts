/**
 * XRPL 네트워크 설정
 */

import { XRPLConfig, MPTFlags } from '../types';

const XRPL_CONFIG: XRPLConfig = {
  // 네트워크 설정
  networks: {
    mainnet: {
      server: 'wss://xrplcluster.com',
      name: 'Mainnet',
      description: 'XRPL 메인넷'
    },
    testnet: {
      server: 'wss://s.altnet.rippletest.net:51233',
      name: 'Testnet',
      description: 'XRPL 테스트넷'
    },
    devnet: {
      server: 'wss://s.devnet.rippletest.net:51233',
      name: 'Devnet',
      description: 'XRPL 개발넷'
    }
  },

  // 기본 설정 (MPT 지원을 위해 Devnet 사용)
  default: {
    network: 'devnet',
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000
  },

  // 트랜잭션 설정
  transaction: {
    fee: '0.001', // XRP
    maxFee: '0.01',
    timeout: 30000
  },

  // 플랫폼 설정
  platform: {
    masterSeed: process.env['PLATFORM_MASTER_SEED'] || '',
    feePercentage: 0.05, // 5%
    platformTokenPercentage: 0.1 // 10%
  },

  // MPT 토큰 설정
  mpt: {
    defaultFlags: {
      MPTfTransferable: true,
      MPTfOnlyXRP: false,
      MPTfTrustLine: true
    } as MPTFlags,
    maxSupply: '1000000000' // 최대 공급량
  },

  // 에스크로 설정
  escrow: {
    defaultDuration: 30 * 24 * 60 * 60, // 30일 (초)
    maxDuration: 365 * 24 * 60 * 60, // 1년 (초)
    minAmount: '1' // 최소 에스크로 금액
  }
};

export default XRPL_CONFIG;
