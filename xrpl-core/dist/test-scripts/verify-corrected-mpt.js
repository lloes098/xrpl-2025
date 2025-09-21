"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
/**
 * 수정된 MPT 발행 ID로 온체인 검증
 */
async function verifyCorrectedMPT() {
    console.log('🔍 Verifying corrected MPT issuance ID...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 새로 생성된 MPT 발행 ID
        const mptIssuanceId = '0060EC19A1765C5F4BEE033C3503B51CCC4EADD6CF07B7E1';
        console.log(`\n📊 Checking MPT: ${mptIssuanceId}`);
        // MPT 객체 직접 확인
        try {
            const mptObject = await client.request({
                command: 'ledger_entry',
                index: mptIssuanceId
            });
            if (mptObject.result.node) {
                const node = mptObject.result.node;
                console.log('   ✅ MPT object found on-chain!');
                console.log(`      - Issuance ID: ${node['MPTokenIssuanceID']}`);
                console.log(`      - Maximum Amount: ${node.MaximumAmount}`);
                console.log(`      - Asset Scale: ${node.AssetScale}`);
                console.log(`      - Transfer Fee: ${node.TransferFee}`);
                console.log(`      - Ledger Index: ${node.LedgerIndex}`);
                console.log(`      - Explorer: https://devnet.xrpl.org/objects/${mptIssuanceId}`);
            }
            else {
                console.log('   ❌ MPT object not found');
            }
        }
        catch (error) {
            console.log(`   ❌ Error checking MPT object: ${error.message}`);
        }
        // 최근 레저에서 MPT 트랜잭션 검색
        console.log('\n🔍 Searching recent ledgers for MPT transactions...');
        const serverInfo = await client.request({ command: 'server_info' });
        const currentLedger = serverInfo.result.info.validated_ledger?.seq || 0;
        console.log(`   Current ledger: ${currentLedger}`);
        const numLedgersToCheck = 10;
        let found = false;
        for (let i = 0; i < numLedgersToCheck; i++) {
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
                            // 우리가 찾는 MPT인지 확인
                            if (tx['MPTokenIssuanceID'] === mptIssuanceId) {
                                console.log(`\n   🎯 This is our MPT token!`);
                                found = true;
                                break;
                            }
                        }
                    }
                }
            }
            catch (error) {
                // 레저를 가져올 수 없는 경우 무시
            }
            if (found)
                break;
        }
        if (!found) {
            console.log('\n   ❌ No MPT Issuance transactions found in recent ledgers');
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
verifyCorrectedMPT().catch(console.error);
//# sourceMappingURL=verify-corrected-mpt.js.map