"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
/**
 * 실제로 MPT 토큰이 있는 지갑 찾기
 */
async function findRealMPT() {
    console.log('🔍 Finding real MPT tokens on XRPL Devnet...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 1. 최근 레저에서 MPT 트랜잭션 검색
        console.log('\n🔍 Searching recent ledgers for MPT transactions...');
        try {
            const serverInfo = await client.request({ command: 'server_info' });
            const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
            console.log(`   Current ledger: ${currentLedger}`);
            // 최근 50개 레저 검색
            for (let i = 0; i < 50; i++) {
                const ledgerIndex = currentLedger - i;
                if (ledgerIndex <= 0)
                    break;
                try {
                    const ledger = await client.request({
                        command: 'ledger',
                        ledger_index: ledgerIndex,
                        transactions: true,
                        expand: true
                    });
                    if (ledger.result.ledger.transactions) {
                        for (const tx of ledger.result.ledger.transactions) {
                            if (tx.TransactionType === 'MPTokenIssuanceCreate') {
                                console.log(`\n   ✅ Found MPT Issuance in ledger ${ledgerIndex}:`);
                                console.log(`      - Hash: ${tx.hash}`);
                                console.log(`      - Issuer: ${tx.Account}`);
                                console.log(`      - MPT Issuance ID: ${tx['MPTokenIssuanceID']}`);
                                console.log(`      - Maximum Amount: ${tx.MaximumAmount}`);
                                console.log(`      - Asset Scale: ${tx.AssetScale}`);
                                console.log(`      - Transfer Fee: ${tx.TransferFee}`);
                                console.log(`      - Explorer: https://devnet.xrpl.org/transactions/${tx.hash}`);
                                console.log(`      - MPT Object: https://devnet.xrpl.org/objects/${tx['MPTokenIssuanceID']}`);
                                // 해당 지갑의 MPT 토큰 확인
                                try {
                                    const mptObjects = await client.request({
                                        command: 'account_objects',
                                        account: tx.Account,
                                        type: 'mptoken'
                                    });
                                    if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
                                        console.log(`      - MPT tokens on account: ${mptObjects.result.account_objects.length}`);
                                        mptObjects.result.account_objects.forEach((mpt, index) => {
                                            console.log(`         ${index + 1}. ${mpt['MPTokenIssuanceID']}`);
                                        });
                                    }
                                    else {
                                        console.log(`      - No MPT tokens found on account`);
                                    }
                                }
                                catch (error) {
                                    console.log(`      - Error checking MPT tokens: ${error}`);
                                }
                            }
                        }
                    }
                }
                catch (error) {
                    // 레저를 가져올 수 없는 경우 무시
                }
            }
        }
        catch (error) {
            console.log(`   ❌ Error searching ledgers: ${error}`);
        }
        // 2. 알려진 테스트 지갑들 확인
        console.log('\n🔍 Checking known test wallets...');
        const testWallets = [
            'rK7qmv2HdrVVvQQkTQ3QYSZwewZFYfnYVP',
            'rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi',
            'rBeN5kMw9Hjx3N4H7x9Nn5mPjdbUNtHj2T',
            'r3uV7cA1sHmBCRgxWTxmrjtWMuqSKiVgF6',
            'rPbcEXdtbzJaQmND2R6pkAppZS6AY4Sqdm'
        ];
        for (const walletAddress of testWallets) {
            try {
                const mptObjects = await client.request({
                    command: 'account_objects',
                    account: walletAddress,
                    type: 'mptoken'
                });
                if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
                    console.log(`\n   ✅ Found MPT tokens on ${walletAddress}:`);
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
                    console.log(`   ❌ No MPT tokens on ${walletAddress}`);
                }
            }
            catch (error) {
                console.log(`   ❌ Error checking ${walletAddress}: ${error}`);
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
findRealMPT().catch(console.error);
//# sourceMappingURL=find-real-mpt.js.map