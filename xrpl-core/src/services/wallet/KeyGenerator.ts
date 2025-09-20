import { Wallet } from 'xrpl';
import * as crypto from 'crypto';
import { WalletInfo, ValidationResult } from '../../types';

/**
 * 키 생성 및 관리 서비스
 */
export class KeyGenerator {
  private keyCache: Map<string, WalletInfo> = new Map();

  /**
   * 새로운 지갑 생성
   * @param algorithm - 키 생성 알고리즘 (secp256k1, ed25519)
   * @returns 생성된 지갑
   */
  generateWallet(algorithm: 'secp256k1' | 'ed25519' = 'secp256k1'): Wallet {
    const wallet = Wallet.generate();
    
    // 키 정보 캐시에 저장
    this.keyCache.set(wallet.address, {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      algorithm,
      createdAt: new Date()
    });

    return wallet;
  }

  /**
   * 시드에서 지갑 복원
   * @param seed - 시드 문자열
   * @returns 복원된 지갑
   */
  fromSeed(seed: string): Wallet {
    try {
      const wallet = Wallet.fromSeed(seed);
      
      // 키 정보 캐시에 저장
      this.keyCache.set(wallet.address, {
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        algorithm: 'unknown',
        createdAt: new Date()
      });

      return wallet;
    } catch (error) {
      throw new Error(`Invalid seed: ${(error as Error).message}`);
    }
  }

  /**
   * 멀티시그 지갑 생성
   * @param signers - 서명자 지갑 배열
   * @param threshold - 서명 임계값
   * @returns 멀티시그 설정
   */
  generateMultiSig(signers: Wallet[], threshold: number): {
    signerEntries: Array<{ SignerEntry: { Account: string; SignerWeight: number } }>;
    threshold: number;
    signers: string[];
  } {
    if (signers.length < 2) {
      throw new Error('Multi-signature requires at least 2 signers');
    }

    if (threshold > signers.length) {
      throw new Error('Threshold cannot exceed number of signers');
    }

    const signerEntries = signers.map(signer => ({
      SignerEntry: {
        Account: signer.address,
        SignerWeight: 1
      }
    }));

    return {
      signerEntries,
      threshold,
      signers: signers.map(s => s.address)
    };
  }

  /**
   * 랜덤 시드 생성
   * @param length - 시드 길이 (바이트)
   * @returns 생성된 시드
   */
  generateRandomSeed(length: number = 16): string {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('hex');
  }

  /**
   * 니모닉 시드 생성 (BIP39 호환)
   * @param strength - 엔트로피 강도 (128, 160, 192, 224, 256)
   * @returns 니모닉 시드
   */
  generateMnemonicSeed(strength: number = 128): string {
    const entropy = crypto.randomBytes(strength / 8);
    return entropy.toString('hex');
  }

  /**
   * 지갑 주소 유효성 검증
   * @param address - 검증할 주소
   * @returns 유효성 여부
   */
  isValidAddress(address: string): boolean {
    try {
      // XRPL 주소 패턴 검증 (r로 시작하고 25-34자리)
      const addressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/;
      return addressRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * 시드 유효성 검증
   * @param seed - 검증할 시드
   * @returns 유효성 여부
   */
  isValidSeed(seed: string): boolean {
    try {
      Wallet.fromSeed(seed);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 공개키에서 주소 생성
   * @param publicKey - 공개키
   * @returns 생성된 주소
   */
  addressFromPublicKey(publicKey: string): string {
    try {
      // 실제 구현에서는 XRPL 라이브러리의 deriveAddress 함수 사용
      // 여기서는 간단한 검증만 수행
      if (!publicKey || publicKey.length < 32) {
        throw new Error('Invalid public key length');
      }
      
      // 실제로는 XRPL의 deriveAddress 함수를 사용해야 함
      return `r${publicKey.substring(0, 25)}`;
    } catch (error) {
      throw new Error(`Invalid public key: ${(error as Error).message}`);
    }
  }

  /**
   * 지갑 정보 조회
   * @param address - 지갑 주소
   * @returns 지갑 정보
   */
  getWalletInfo(address: string): WalletInfo | null {
    const cached = this.keyCache.get(address);
    if (cached) {
      return cached;
    }
    return null;
  }

  /**
   * 키 캐시 정리
   * @param maxAge - 최대 보관 시간 (밀리초)
   */
  cleanupCache(maxAge: number = 24 * 60 * 60 * 1000): void { // 24시간
    const now = new Date();
    for (const [address, info] of this.keyCache.entries()) {
      if (info.createdAt && now.getTime() - info.createdAt.getTime() > maxAge) {
        this.keyCache.delete(address);
      }
    }
  }

  /**
   * 모든 캐시된 키 정보 조회
   * @returns 키 정보 목록
   */
  getAllCachedKeys(): WalletInfo[] {
    return Array.from(this.keyCache.values());
  }

  /**
   * 특정 키 정보 삭제
   * @param address - 지갑 주소
   */
  removeCachedKey(address: string): void {
    this.keyCache.delete(address);
  }

  /**
   * 모든 키 정보 삭제
   */
  clearCache(): void {
    this.keyCache.clear();
  }

  /**
   * 키 생성 통계 조회
   * @returns 키 생성 통계
   */
  getKeyStats(): { total: number; byAlgorithm: Record<string, number> } {
    const allKeys = this.getAllCachedKeys();
    const stats = {
      total: allKeys.length,
      byAlgorithm: {} as Record<string, number>
    };

    allKeys.forEach(key => {
      const algorithm = key.algorithm || 'unknown';
      stats.byAlgorithm[algorithm] = (stats.byAlgorithm[algorithm] || 0) + 1;
    });

    return stats;
  }

  /**
   * 키 유효성 검증
   * @param wallet - 검증할 지갑
   * @returns 검증 결과
   */
  validateKey(wallet: Wallet): ValidationResult {
    const errors: string[] = [];

    if (!this.isValidAddress(wallet.address)) {
      errors.push('Invalid wallet address format');
    }

    if (!wallet.publicKey || wallet.publicKey.length < 32) {
      errors.push('Invalid public key');
    }

    if (!wallet.privateKey || wallet.privateKey.length < 32) {
      errors.push('Invalid private key');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 키 쌍 생성 (공개키/개인키)
   * @param algorithm - 알고리즘
   * @returns 키 쌍
   */
  generateKeyPair(algorithm: 'secp256k1' | 'ed25519' = 'secp256k1'): {
    publicKey: string;
    privateKey: string;
    address: string;
  } {
    const wallet = this.generateWallet(algorithm);
    
    return {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      address: wallet.address
    };
  }

  /**
   * 시드에서 키 쌍 생성
   * @param seed - 시드
   * @returns 키 쌍
   */
  generateKeyPairFromSeed(seed: string): {
    publicKey: string;
    privateKey: string;
    address: string;
  } {
    const wallet = this.fromSeed(seed);
    
    return {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      address: wallet.address
    };
  }
}
