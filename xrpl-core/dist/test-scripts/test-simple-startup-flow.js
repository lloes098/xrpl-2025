"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
const axios_1 = __importDefault(require("axios"));
/**
 * 간단한 창업 프로젝트 흐름 검증
 * 기존에 성공한 간단한 프로젝트 생성 방식 사용
 */
async function testSimpleStartupFlow() {
    console.log('🚀 Testing Simple Startup Project Flow on XRPL Devnet...');
    const client = new xrpl_1.Client('wss://s.devnet.rippletest.net:51233');
    try {
        await client.connect();
        console.log('✅ Connected to XRPL Devnet');
        // 1. 창업자 지갑 생성 및 펀딩
        console.log('\n👤 Creating founder wallet...');
        const founderWallet = xrpl_1.Wallet.generate();
        console.log(`   - Founder Address: ${founderWallet.address}`);
        console.log(`   - Founder Seed: ${founderWallet.seed}`);
        const fundResult = await client.fundWallet(founderWallet);
        console.log(`   - Funded: ${fundResult.balance} XRP`);
        // 2. 투자자 지갑들 생성 및 펀딩
        console.log('\n💰 Creating investor wallets...');
        const investors = [];
        for (let i = 0; i < 3; i++) {
            const investorWallet = xrpl_1.Wallet.generate();
            await client.fundWallet(investorWallet);
            investors.push({
                address: investorWallet.address,
                seed: investorWallet.seed,
                name: `Investor ${i + 1}`
            });
            console.log(`   - ${investors[i].name}: ${investorWallet.address}`);
        }
        // 3. 간단한 창업 프로젝트 데이터 (기존 성공한 방식)
        const simpleProjectData = {
            name: 'AI Healthcare Platform',
            description: 'AI-powered medical diagnosis platform',
            targetAmount: 1000,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            creatorWallet: founderWallet.address,
            website: 'https://aihealthcare.com',
            logo: 'https://aihealthcare.com/logo.png',
            category: 'Healthcare',
            tags: ['AI', 'Healthcare'],
            socialLinks: {
                twitter: 'https://twitter.com/aihealthcare'
            },
            tokenomics: {
                totalTokens: 1000000,
                tokenPrice: 0.001,
                platformTokenShare: 0.1,
                creatorTokenShare: 0.2,
                investorTokenShare: 0.7
            },
            milestones: [{
                    name: 'MVP Development',
                    description: 'Complete MVP with core features',
                    targetAmount: 500,
                    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                }]
        };
        // 4. 프로젝트 생성 (MPT 토큰 발행)
        console.log('\n🏗️ Creating startup project...');
        const projectResponse = await axios_1.default.post('http://localhost:3001/api/projects', simpleProjectData);
        if (projectResponse.status === 201) {
            console.log('✅ Project created successfully!');
            console.log(`   - Project ID: ${projectResponse.data.data.projectId}`);
            console.log(`   - MPT ID: ${projectResponse.data.data.mptIssuanceId}`);
            console.log(`   - Transaction Hash: ${projectResponse.data.data.txHash}`);
            const projectId = projectResponse.data.data.projectId;
            const mptId = projectResponse.data.data.mptIssuanceId;
            // 5. 투자 처리 (에스크로 생성)
            console.log('\n💸 Processing investments...');
            const investments = [];
            for (let i = 0; i < investors.length; i++) {
                const investmentAmount = 100 + (i * 50); // 100, 150, 200 XRP
                const investmentData = {
                    projectId: projectId,
                    investorAddress: investors[i].address,
                    investorSeed: investors[i].seed,
                    amount: investmentAmount,
                    milestoneId: 'milestone_1' // 임시 마일스톤 ID
                };
                try {
                    const investmentResponse = await axios_1.default.post('http://localhost:3001/api/investments', investmentData);
                    if (investmentResponse.status === 201) {
                        console.log(`   ✅ ${investors[i].name} invested ${investmentAmount} XRP`);
                        console.log(`      - Investment ID: ${investmentResponse.data.investmentId}`);
                        console.log(`      - Transaction Hash: ${investmentResponse.data.txHash}`);
                        investments.push(investmentResponse.data);
                    }
                }
                catch (error) {
                    console.log(`   ❌ ${investors[i].name} investment failed: ${error}`);
                }
            }
            // 6. 마일스톤 달성 (에스크로 완료)
            console.log('\n🎯 Achieving milestones...');
            try {
                const milestoneResponse = await axios_1.default.post(`http://localhost:3001/api/projects/${projectId}/milestones/milestone_1/achieve`, {
                    evidence: 'MVP development completed successfully',
                    proof: 'https://github.com/aihealthcare/mvp-demo'
                });
                if (milestoneResponse.status === 200) {
                    console.log('✅ First milestone achieved!');
                    console.log(`   - Milestone: ${milestoneResponse.data.milestone?.name || 'Unknown'}`);
                    console.log(`   - Status: ${milestoneResponse.data.milestone?.status || 'Unknown'}`);
                }
            }
            catch (error) {
                console.log(`   ❌ Milestone achievement failed: ${error}`);
            }
            // 7. 프로젝트 상세 정보 조회
            console.log('\n📊 Project details:');
            try {
                const projectDetails = await axios_1.default.get(`http://localhost:3001/api/projects/${projectId}`);
                console.log('   Project Information:');
                console.log(`   - Name: ${projectDetails.data.data?.name || 'Unknown'}`);
                console.log(`   - Description: ${projectDetails.data.data?.description || 'Unknown'}`);
                console.log(`   - Target Amount: ${projectDetails.data.data?.targetAmount || 'Unknown'} XRP`);
                console.log(`   - Current Amount: ${projectDetails.data.data?.currentAmount || 'Unknown'} XRP`);
                console.log(`   - Status: ${projectDetails.data.data?.status || 'Unknown'}`);
                console.log(`   - MPT ID: ${projectDetails.data.data?.mptData?.mptIssuanceId || 'Unknown'}`);
                console.log(`   - Milestones: ${projectDetails.data.data?.milestones?.length || 0}`);
                console.log(`   - Investors: ${projectDetails.data.data?.investors?.size || 0}`);
            }
            catch (error) {
                console.log(`   ❌ Failed to get project details: ${error}`);
            }
            // 8. XRPL Devnet Explorer 링크
            console.log('\n🌐 XRPL Devnet Explorer Links:');
            console.log(`   - Founder Wallet: https://devnet.xrpl.org/accounts/${founderWallet.address}`);
            console.log(`   - Platform Wallet: https://devnet.xrpl.org/accounts/rH5qaDn3xbhKJ4J2deBa4erCkecuB21hJi`);
            console.log(`   - Project MPT: https://devnet.xrpl.org/objects/${mptId}`);
            investors.forEach((investor, index) => {
                console.log(`   - ${investor.name}: https://devnet.xrpl.org/accounts/${investor.address}`);
            });
            // 9. 트랜잭션 검증
            console.log('\n🔍 Verifying transactions on-chain...');
            await verifyTransactionsOnChain(client, founderWallet.address, investors.map(i => i.address));
        }
        else {
            console.log('❌ Project creation failed');
            console.log(projectResponse.data);
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
/**
 * 온체인 트랜잭션 검증
 */
async function verifyTransactionsOnChain(client, founderAddress, investorAddresses) {
    try {
        // 1. 창업자 지갑 정보
        console.log('\n   📊 Founder wallet status:');
        const founderInfo = await client.request({
            command: 'account_info',
            account: founderAddress
        });
        console.log(`      - Balance: ${founderInfo.result.account_data.Balance} drops`);
        console.log(`      - Sequence: ${founderInfo.result.account_data.Sequence}`);
        // 2. MPT 토큰 조회
        console.log('\n   🪙 MPT tokens:');
        const mptObjects = await client.request({
            command: 'account_objects',
            account: founderAddress,
            type: 'mptoken'
        });
        if (mptObjects.result.account_objects && mptObjects.result.account_objects.length > 0) {
            mptObjects.result.account_objects.forEach((mpt, index) => {
                console.log(`      ${index + 1}. MPT Token:`);
                console.log(`         - Issuance ID: ${mpt.MPTokenIssuanceID}`);
                console.log(`         - Maximum Amount: ${mpt.MaximumAmount}`);
                console.log(`         - Asset Scale: ${mpt.AssetScale}`);
                console.log(`         - Transfer Fee: ${mpt.TransferFee}`);
                console.log(`         - Ledger Index: ${mpt.LedgerIndex}`);
            });
        }
        else {
            console.log('      No MPT tokens found');
        }
        // 3. 투자자 지갑들 정보
        console.log('\n   💰 Investor wallets status:');
        for (const address of investorAddresses) {
            try {
                const investorInfo = await client.request({
                    command: 'account_info',
                    account: address
                });
                console.log(`      - ${address}: ${investorInfo.result.account_data.Balance} drops`);
            }
            catch (error) {
                console.log(`      - ${address}: Account not found`);
            }
        }
        // 4. 최근 트랜잭션 조회
        console.log('\n   📜 Recent transactions:');
        const accountTx = await client.request({
            command: 'account_tx',
            account: founderAddress,
            limit: 5,
            binary: false
        });
        if (accountTx.result.transactions && accountTx.result.transactions.length > 0) {
            accountTx.result.transactions.forEach((tx, index) => {
                console.log(`      ${index + 1}. Transaction:`);
                console.log(`         - Hash: ${tx.tx_hash || 'N/A'}`);
                console.log(`         - Ledger: ${tx.ledger_index || 'N/A'}`);
                if (tx.tx) {
                    console.log(`         - Type: ${tx.tx.TransactionType || 'N/A'}`);
                    console.log(`         - Date: ${tx.tx.date ? new Date(tx.tx.date * 1000).toISOString() : 'N/A'}`);
                    if (tx.tx.TransactionType === 'MPTokenIssuanceCreate') {
                        console.log(`         - MPT Issuance ID: ${tx.tx.MPTokenIssuanceID || 'N/A'}`);
                    }
                }
                if (tx.tx_hash) {
                    const explorerUrl = `https://devnet.xrpl.org/transactions/${tx.tx_hash}`;
                    console.log(`         - Explorer: ${explorerUrl}`);
                }
            });
        }
    }
    catch (error) {
        console.log(`   ❌ Error verifying transactions: ${error}`);
    }
}
// 실행
testSimpleStartupFlow().catch(console.error);
//# sourceMappingURL=test-simple-startup-flow.js.map