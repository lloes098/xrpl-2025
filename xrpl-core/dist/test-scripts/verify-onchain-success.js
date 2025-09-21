"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
/**
 * 온체인에서 실제 성공한 트랜잭션 확인
 */
async function verifyOnchainSuccess() {
    console.log('🔍 Verifying on-chain transaction success...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 1. 우리가 생성한 지갑들의 실제 상태 확인
        const testWallets = [
            'rK7qmv2HdrVVvQQkTQ3QYSZwewZFYfnYVP', // 마지막 성공한 프로젝트
            'rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi', // 플랫폼 지갑
        ];
        console.log('\n📊 Checking wallet status:');
        for (const walletAddress of testWallets) {
            try {
                const accountInfo = await client.request({
                    command: 'account_info',
                    account: walletAddress
                });
                console.log(`\n   ${walletAddress}:`);
                console.log(`   - Balance: ${accountInfo.result.account_data.Balance} drops`);
                console.log(`   - Sequence: ${accountInfo.result.account_data.Sequence}`);
                console.log(`   - Ledger Index: ${accountInfo.result.ledger_index}`);
                // XRPL Devnet Explorer 링크
                const explorerUrl = `https://devnet.xrpl.org/accounts/${walletAddress}`;
                console.log(`   - Explorer: ${explorerUrl}`);
            }
            catch (error) {
                console.log(`   ${walletAddress}: ❌ Account not found`);
            }
        }
        // 2. 최근 ledger에서 우리 지갑과 관련된 트랜잭션 검색
        console.log('\n🔍 Searching for transactions involving our wallets...');
        const serverInfo = await client.request({ command: 'server_info' });
        const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
        for (let i = 0; i < 30; i++) {
            const ledgerIndex = currentLedger - i;
            try {
                const ledgerData = await client.request({
                    command: 'ledger',
                    ledger_index: ledgerIndex,
                    transactions: true
                });
                if (ledgerData.result.ledger.transactions) {
                    // 우리 지갑과 관련된 트랜잭션 필터링
                    const relevantTransactions = ledgerData.result.ledger.transactions.filter((tx) => testWallets.includes(tx.Account) ||
                        testWallets.includes(tx.Destination) ||
                        tx.TransactionType === 'MPTokenIssuanceCreate');
                    if (relevantTransactions.length > 0) {
                        console.log(`\n🎯 Found ${relevantTransactions.length} relevant transactions in ledger ${ledgerIndex}:`);
                        relevantTransactions.forEach((tx, index) => {
                            console.log(`\n   ${index + 1}. Transaction:`);
                            console.log(`      - Type: ${tx.TransactionType || 'N/A'}`);
                            console.log(`      - Hash: ${tx.hash || 'N/A'}`);
                            console.log(`      - Account: ${tx.Account || 'N/A'}`);
                            console.log(`      - Destination: ${tx.Destination || 'N/A'}`);
                            console.log(`      - Amount: ${tx.Amount || 'N/A'}`);
                            if (tx.TransactionType === 'MPTokenIssuanceCreate') {
                                console.log(`      - MPT Issuance ID: ${tx.MPTokenIssuanceID || 'N/A'}`);
                                console.log(`      - Maximum Amount: ${tx.MaximumAmount || 'N/A'}`);
                            }
                            if (tx.hash) {
                                const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.hash}`;
                                console.log(`      - Explorer: ${explorerUrl}`);
                            }
                        });
                    }
                }
            }
            catch (ledgerError) {
                continue;
            }
        }
        // 3. XRPL Devnet Explorer 직접 링크 제공
        console.log('\n🌐 XRPL Devnet Explorer Links:');
        console.log('   - Main Explorer: https://devnet.xrpl.org/');
        console.log('   - Bithomp Explorer: https://devnet.bithomp.com/');
        console.log('\n📋 Our Test Wallets:');
        testWallets.forEach((wallet, index) => {
            console.log(`   ${index + 1}. ${wallet}`);
            console.log(`      - Explorer: https://devnet.xrpl.org/accounts/${wallet}`);
        });
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
verifyOnchainSuccess().catch(console.error);
//# sourceMappingURL=verify-onchain-success.js.map