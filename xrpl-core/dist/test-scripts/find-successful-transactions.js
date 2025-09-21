"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
/**
 * 성공한 트랜잭션을 찾아서 온체인 트래커에서 확인
 */
async function findSuccessfulTransactions() {
    console.log('🔍 Finding successful transactions on XRPL Devnet...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 성공한 프로젝트의 발행자 지갑 주소들
        const issuerWallets = [
            'rK7qmv2HdrVVvQQkTQ3QYSZwewZFYfnYVP', // 마지막 성공한 프로젝트
            'rnFmePVobKp7r8go9ud1fw1bLPTHyUqvhc',
            'rNiEa8rH4Y6AeHPf4nKVj3b89s9A5y1kZz',
            'r9rh9NWA6ywBTwcN5gpynays1f7nsyUPeH',
            'rp4WQbjLBaQgKFtZUfTBUKhw6D4vQwHxW2'
        ];
        for (const walletAddress of issuerWallets) {
            console.log(`\n📊 Checking wallet: ${walletAddress}`);
            try {
                // 1. 계정 정보 조회
                const accountInfo = await client.request({
                    command: 'account_info',
                    account: walletAddress
                });
                console.log(`   ✅ Account exists - Balance: ${accountInfo.result.account_data.Balance} drops`);
                console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
                // 2. MPT 토큰 객체 조회
                const mptObjects = await client.request({
                    command: 'account_objects',
                    account: walletAddress,
                    type: 'mptoken'
                });
                if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
                    console.log(`   🪙 Found ${mptObjects.result.account_objects.length} MPT tokens:`);
                    mptObjects.result.account_objects.forEach((mpt, index) => {
                        console.log(`\n   ${index + 1}. MPT Token:`);
                        console.log(`      - Issuance ID: ${mpt.MPTokenIssuanceID}`);
                        console.log(`      - Maximum Amount: ${mpt.MaximumAmount}`);
                        console.log(`      - Asset Scale: ${mpt.AssetScale}`);
                        console.log(`      - Transfer Fee: ${mpt.TransferFee}`);
                        console.log(`      - Flags: ${mpt.Flags}`);
                        console.log(`      - Ledger Index: ${mpt.LedgerIndex}`);
                        // XRPL Devnet Explorer 링크 생성
                        const explorerUrl = `https://devnet.xrpl.org/objects/${mpt.index}`;
                        console.log(`      - Explorer: ${explorerUrl}`);
                    });
                }
                else {
                    console.log(`   ❌ No MPT tokens found`);
                }
                // 3. 최근 트랜잭션 조회 (간단한 방법)
                try {
                    const accountTx = await client.request({
                        command: 'account_tx',
                        account: walletAddress,
                        limit: 5,
                        binary: false
                    });
                    if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
                        console.log(`   📜 Recent transactions (${accountTx.result.transactions.length}):`);
                        accountTx.result.transactions.forEach((tx, index) => {
                            console.log(`\n   ${index + 1}. Transaction:`);
                            console.log(`      - Hash: ${tx.tx_hash || 'N/A'}`);
                            console.log(`      - Ledger: ${tx.ledger_index || 'N/A'}`);
                            if (tx.tx) {
                                console.log(`      - Type: ${tx.tx.TransactionType || 'N/A'}`);
                                console.log(`      - Date: ${tx.tx.date ? new Date(tx.tx.date * 1000).toISOString() : 'N/A'}`);
                                if (tx.tx.TransactionType === 'MPTokenIssuanceCreate') {
                                    console.log(`      - MPT Issuance ID: ${tx.tx.MPTokenIssuanceID || 'N/A'}`);
                                }
                            }
                            // XRPL Devnet Explorer 링크 생성
                            if (tx.tx_hash) {
                                const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.tx_hash}`;
                                console.log(`      - Explorer: ${explorerUrl}`);
                            }
                        });
                    }
                }
                catch (txError) {
                    console.log(`   ⚠️ Could not fetch transaction history: ${txError}`);
                }
            }
            catch (error) {
                console.log(`   ❌ Account not found or error: ${error}`);
            }
        }
        // 4. 최신 ledger에서 MPT 토큰 검색
        console.log('\n🔍 Searching for MPT tokens in recent ledgers...');
        const serverInfo = await client.request({ command: 'server_info' });
        const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
        console.log(`   Current ledger: ${currentLedger}`);
        // 최근 10개 ledger에서 MPT 토큰 검색
        for (let i = 0; i < 10; i++) {
            const ledgerIndex = currentLedger - i;
            try {
                const ledgerData = await client.request({
                    command: 'ledger',
                    ledger_index: ledgerIndex,
                    transactions: true
                });
                if (ledgerData.result.ledger.transactions) {
                    const mptTransactions = ledgerData.result.ledger.transactions.filter((tx) => tx.TransactionType === 'MPTokenIssuanceCreate');
                    if (mptTransactions.length > 0) {
                        console.log(`\n   🎯 Found ${mptTransactions.length} MPT transactions in ledger ${ledgerIndex}:`);
                        mptTransactions.forEach((tx, index) => {
                            console.log(`\n   ${index + 1}. MPT Transaction:`);
                            console.log(`      - Hash: ${tx.hash || 'N/A'}`);
                            console.log(`      - Account: ${tx.Account || 'N/A'}`);
                            console.log(`      - MPT Issuance ID: ${tx.MPTokenIssuanceID || 'N/A'}`);
                            console.log(`      - Maximum Amount: ${tx.MaximumAmount || 'N/A'}`);
                            if (tx.hash) {
                                const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.hash}`;
                                console.log(`      - Explorer: ${explorerUrl}`);
                            }
                        });
                    }
                }
            }
            catch (ledgerError) {
                // 특정 ledger를 찾을 수 없는 경우 무시
                continue;
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
findSuccessfulTransactions().catch(console.error);
//# sourceMappingURL=find-successful-transactions.js.map