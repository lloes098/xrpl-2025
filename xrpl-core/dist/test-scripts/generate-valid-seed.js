"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
/**
 * 유효한 XRPL 시드 생성 및 검증
 */
async function generateValidSeed() {
    console.log('🔑 Generating valid XRPL seeds...');
    try {
        // 1. 새로운 지갑 생성 (유효한 시드 자동 생성)
        const wallet = xrpl_1.Wallet.generate();
        console.log('✅ Generated wallet:');
        console.log(`   - Address: ${wallet.address}`);
        console.log(`   - Public Key: ${wallet.publicKey}`);
        console.log(`   - Private Key: ${wallet.privateKey}`);
        console.log(`   - Seed: ${wallet.seed}`);
        // 2. 시드 검증 (시드로부터 지갑 복원)
        const restoredWallet = xrpl_1.Wallet.fromSeed(wallet.seed);
        console.log('\n✅ Seed validation:');
        console.log(`   - Restored Address: ${restoredWallet.address}`);
        console.log(`   - Address Match: ${wallet.address === restoredWallet.address}`);
        // 3. 여러 개의 유효한 시드 생성
        console.log('\n🔑 Multiple valid seeds:');
        for (let i = 0; i < 5; i++) {
            const testWallet = xrpl_1.Wallet.generate();
            console.log(`   ${i + 1}. ${testWallet.seed} -> ${testWallet.address}`);
        }
        // 4. Devnet에서 테스트할 수 있는 시드 반환
        console.log('\n🎯 Use this seed for Devnet testing:');
        console.log(`   Seed: ${wallet.seed}`);
        console.log(`   Address: ${wallet.address}`);
    }
    catch (error) {
        console.error('❌ Error generating seed:', error);
    }
}
// 실행
generateValidSeed().catch(console.error);
//# sourceMappingURL=generate-valid-seed.js.map