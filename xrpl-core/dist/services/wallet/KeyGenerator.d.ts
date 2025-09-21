import { Wallet } from 'xrpl';
import { WalletInfo, ValidationResult } from '../../types';
/**
 * 키 생성 및 관리 서비스
 */
export declare class KeyGenerator {
    private keyCache;
    /**
     * 새로운 지갑 생성
     * @param algorithm - 키 생성 알고리즘 (secp256k1, ed25519)
     * @returns 생성된 지갑
     */
    generateWallet(algorithm?: 'secp256k1' | 'ed25519'): Wallet;
    /**
     * 시드에서 지갑 복원
     * @param seed - 시드 문자열
     * @returns 복원된 지갑
     */
    fromSeed(seed: string): Wallet;
    /**
     * 멀티시그 지갑 생성
     * @param signers - 서명자 지갑 배열
     * @param threshold - 서명 임계값
     * @returns 멀티시그 설정
     */
    generateMultiSig(signers: Wallet[], threshold: number): {
        signerEntries: Array<{
            SignerEntry: {
                Account: string;
                SignerWeight: number;
            };
        }>;
        threshold: number;
        signers: string[];
    };
    /**
     * 랜덤 시드 생성
     * @param length - 시드 길이 (바이트)
     * @returns 생성된 시드
     */
    generateRandomSeed(length?: number): string;
    /**
     * 니모닉 시드 생성 (BIP39 호환)
     * @param strength - 엔트로피 강도 (128, 160, 192, 224, 256)
     * @returns 니모닉 시드
     */
    generateMnemonicSeed(strength?: number): string;
    /**
     * 지갑 주소 유효성 검증
     * @param address - 검증할 주소
     * @returns 유효성 여부
     */
    isValidAddress(address: string): boolean;
    /**
     * 시드 유효성 검증
     * @param seed - 검증할 시드
     * @returns 유효성 여부
     */
    isValidSeed(seed: string): boolean;
    /**
     * 공개키에서 주소 생성
     * @param publicKey - 공개키
     * @returns 생성된 주소
     */
    addressFromPublicKey(publicKey: string): string;
    /**
     * 지갑 정보 조회
     * @param address - 지갑 주소
     * @returns 지갑 정보
     */
    getWalletInfo(address: string): WalletInfo | null;
    /**
     * 키 캐시 정리
     * @param maxAge - 최대 보관 시간 (밀리초)
     */
    cleanupCache(maxAge?: number): void;
    /**
     * 모든 캐시된 키 정보 조회
     * @returns 키 정보 목록
     */
    getAllCachedKeys(): WalletInfo[];
    /**
     * 특정 키 정보 삭제
     * @param address - 지갑 주소
     */
    removeCachedKey(address: string): void;
    /**
     * 모든 키 정보 삭제
     */
    clearCache(): void;
    /**
     * 키 생성 통계 조회
     * @returns 키 생성 통계
     */
    getKeyStats(): {
        total: number;
        byAlgorithm: Record<string, number>;
    };
    /**
     * 키 유효성 검증
     * @param wallet - 검증할 지갑
     * @returns 검증 결과
     */
    validateKey(wallet: Wallet): ValidationResult;
    /**
     * 키 쌍 생성 (공개키/개인키)
     * @param algorithm - 알고리즘
     * @returns 키 쌍
     */
    generateKeyPair(algorithm?: 'secp256k1' | 'ed25519'): {
        publicKey: string;
        privateKey: string;
        address: string;
    };
    /**
     * 시드에서 키 쌍 생성
     * @param seed - 시드
     * @returns 키 쌍
     */
    generateKeyPairFromSeed(seed: string): {
        publicKey: string;
        privateKey: string;
        address: string;
    };
}
//# sourceMappingURL=KeyGenerator.d.ts.map