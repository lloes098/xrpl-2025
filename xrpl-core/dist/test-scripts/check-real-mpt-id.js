"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
/**
 * 실제 MPT 발행 ID 확인
 */
async function checkRealMPTId() {
    console.log('🔍 Checking real MPT issuance IDs...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 최근 성공한 프로젝트들의 발행자 지갑 확인
        const issuers = [
            'rBeN5kMw9Hjx3N4H7x9Nn5mPjdbUNtHj2T', // proj_1758379908511_7y62bp5b9
            'r3uV7cA1sHmBCRgxWTxmrjtWMuqSKiVgF6', // proj_1758379963063_4rvof27xo
            'rPbcEXdtbzJaQmND2R6pkAppZS6AY4Sqdm', // proj_1758380045061_0llwtt2ey
            'rLuhvjtN2REBM5t1YXZY9MThqbngjqACjt', // proj_1758381460696_e2gf1cc2x
            'r4TC8MB6HNHgQx16TRPm8MDovb6bA1bS6F' // proj_1758381804176_q5y7tjg0w
        ];
        for (const issuer of issuers) {
            console.log(`\n📊 Checking issuer: ${issuer}`);
            try {
                // 계정 정보 확인
                const accountInfo = await client.request({
                    command: 'account_info',
                    account: issuer
                });
                console.log(`   - Balance: ${accountInfo.result.account_data.Balance} drops`);
                console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
                // MPT 토큰 확인
                const mptObjects = await client.request({
                    command: 'account_objects',
                    account: issuer,
                    type: 'mptoken'
                });
                if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
                    console.log(`   ✅ Found ${mptObjects.result.account_objects.length} MPT tokens:`);
                    mptObjects.result.account_objects.forEach((mpt, index) => {
                        console.log(`      ${index + 1}. MPT Token:`);
                        console.log(`         - Issuance ID: ${mpt['MPTokenIssuanceID']}`);
                        console.log(`         - Maximum Amount: ${mpt.MaximumAmount}`);
                        console.log(`         - Asset Scale: ${mpt.AssetScale}`);
                        console.log(`         - Transfer Fee: ${mpt.TransferFee}`);
                        console.log(`         - Ledger Index: ${mpt.LedgerIndex}`);
                        console.log(`         - Explorer: https://devnet.xrpl.org/objects/${mpt['MPTokenIssuanceID']}`);
                    });
                }
                else {
                    console.log(`   ❌ No MPT tokens found on issuer wallet`);
                }
                // 최근 트랜잭션 확인
                const accountTx = await client.request({
                    command: 'account_tx',
                    account: issuer,
                    limit: 10
                });
                console.log(`   📜 Recent transactions:`);
                accountTx.result.transactions.forEach((tx, index) => {
                    if (tx.tx.TransactionType === 'MPTokenIssuanceCreate') {
                        console.log(`      ${index + 1}. MPT Issuance:`);
                        console.log(`         - Hash: ${tx.tx.hash}`);
                        console.log(`         - MPT Issuance ID: ${tx.tx['MPTokenIssuanceID']}`);
                        console.log(`         - Explorer: https://devnet.xrpl.org/transactions/${tx.tx.hash}`);
                    }
                });
            }
            catch (error) {
                console.log(`   ❌ Error checking issuer: ${error.message}`);
            }
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await client.disconnect();
        console.log('\n🔌 Disconnected from Devnet');
    }
}
// 실행
checkRealMPTId().catch(console.error);
//# sourceMappingURL=check-real-mpt-id.js.map