"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:3001/api';
async function testNewStartupFlow() {
    console.log('🚀 New Startup Platform Flow Test');
    console.log('=====================================\n');
    try {
        // Step 1: Create a new startup project
        console.log('📝 Step 1: Creating New Startup Project...');
        const projectData = {
            name: 'Blockchain DeFi Platform',
            description: 'A revolutionary decentralized finance platform built on XRPL',
            targetAmount: 10000, // 10,000 XRP
            deadline: '2026-12-31',
            creatorWallet: 'sEd7vWe7bM7gX92865hGokZssJmy757' // Use valid seed
        };
        const projectResponse = await axios_1.default.post(`${API_BASE}/projects`, projectData);
        if (projectResponse.data.success) {
            console.log('✅ Project created successfully!');
            console.log(`   - Project ID: ${projectResponse.data.data.projectId}`);
            console.log(`   - MPT Issuance ID: ${projectResponse.data.data.mptIssuanceId}`);
            console.log(`   - Transaction Hash: ${projectResponse.data.data.txHash}`);
            console.log(`   - Explorer: https://devnet.xrpl.org/objects/${projectResponse.data.data.mptIssuanceId}`);
        }
        else {
            throw new Error(`Project creation failed: ${projectResponse.data.message}`);
        }
        // Step 2: Process multiple investments from different investors
        console.log('\n💰 Step 2: Processing Multiple Investments...');
        // Generate new valid investor wallets
        const investors = [
            {
                wallet: "sEd7vWe7bM7gX92865hGokZssJmy757", // Alice
                amount: 2000,
                name: "Crypto Ventures"
            },
            {
                wallet: "sEd7HqX3XRdqfq3soCWNav9Ffau65eD", // Bob
                amount: 3000,
                name: "Blockchain Capital"
            },
            {
                wallet: "sEd7oaLXSpQqejQDx6E3oNzpbrERHj3", // Charlie
                amount: 1500,
                name: "DeFi Fund"
            },
            {
                wallet: "sEd7Th4AvQU4UNJudt99p3vg7CZNoeLn", // Diana
                amount: 2500,
                name: "Innovation Partners"
            }
        ];
        const investmentPromises = investors.map(async (investor, index) => {
            console.log(`   Processing investment ${index + 1}/4: ${investor.name} (${investor.amount} XRP)`);
            const investmentData = {
                projectId: projectResponse.data.data.projectId,
                investorWallet: investor.wallet,
                amount: investor.amount,
                paymentMethod: "XRP",
                message: `Investment from ${investor.name}`
            };
            try {
                const investmentResponse = await axios_1.default.post(`${API_BASE}/investments`, investmentData);
                if (investmentResponse.data.success) {
                    console.log(`   ✅ ${investor.name} investment successful`);
                    return investmentResponse.data.data;
                }
                else {
                    console.log(`   ❌ ${investor.name} investment failed: ${investmentResponse.data.message}`);
                    return null;
                }
            }
            catch (error) {
                console.log(`   ❌ ${investor.name} investment error: ${error.response?.data?.message || error.message}`);
                return null;
            }
        });
        const investmentResults = await Promise.all(investmentPromises);
        const successfulInvestments = investmentResults.filter(result => result !== null);
        console.log(`\n✅ ${successfulInvestments.length}/4 investments processed successfully`);
        // Step 3: Check project status
        console.log('\n📊 Step 3: Checking Project Status...');
        const projectStatusResponse = await axios_1.default.get(`${API_BASE}/projects/${projectResponse.data.data.projectId}`);
        if (projectStatusResponse.data.success) {
            const project = projectStatusResponse.data.data;
            console.log('✅ Project status retrieved:');
            console.log(`   - Current Amount: ${project.currentAmount} XRP`);
            console.log(`   - Target Amount: ${project.targetAmount} XRP`);
            console.log(`   - Progress: ${((project.currentAmount / project.targetAmount) * 100).toFixed(1)}%`);
            console.log(`   - Status: ${project.status}`);
            console.log(`   - Milestones: ${project.milestones.length}`);
        }
        // Step 4: Skip milestone achievement (no milestones created)
        console.log('\n🎯 Step 4: Skipping Milestone Achievement...');
        console.log('   - No milestones were created for this project');
        console.log('   - Continuing with token balance checks...');
        // Step 5: Check investor MPT token balances
        console.log('\n🪙 Step 5: Checking Investor MPT Token Balances...');
        for (const investor of investors) {
            try {
                // Get wallet address from seed
                const { Wallet } = await Promise.resolve().then(() => __importStar(require('xrpl')));
                const wallet = Wallet.fromSeed(investor.wallet);
                const balanceResponse = await axios_1.default.get(`${API_BASE}/tokens/balance/${wallet.address}`);
                if (balanceResponse.data.success) {
                    const totalBalance = balanceResponse.data.data.totalBalance;
                    console.log(`   ${investor.name}: ${totalBalance.toLocaleString()} MPT tokens`);
                }
                else {
                    console.log(`   ${investor.name}: Balance check failed`);
                }
            }
            catch (error) {
                console.log(`   ${investor.name}: Balance check failed`);
            }
        }
        // Step 6: Simulate revenue distribution
        console.log('\n💸 Step 6: Simulating Revenue Distribution...');
        const revenueData = {
            revenueAmount: 2000 // 2,000 XRP revenue
        };
        const revenueResponse = await axios_1.default.post(`${API_BASE}/projects/${projectResponse.data.data.projectId}/revenue`, revenueData);
        if (revenueResponse.data.success) {
            console.log('✅ Revenue distribution completed!');
            console.log(`   - Total Revenue: ${revenueResponse.data.data.totalRevenue} XRP`);
            console.log(`   - Platform Share: ${revenueResponse.data.data.platformShare} XRP`);
            console.log(`   - Creator Share: ${revenueResponse.data.data.creatorShare} XRP`);
            console.log(`   - Investor Share: ${revenueResponse.data.data.investorShare} XRP`);
        }
        else {
            console.log(`❌ Revenue distribution failed: ${revenueResponse.data.message}`);
        }
        // Step 7: Final project status
        console.log('\n📈 Step 7: Final Project Status...');
        const finalStatusResponse = await axios_1.default.get(`${API_BASE}/projects/${projectResponse.data.data.projectId}`);
        if (finalStatusResponse.data.success) {
            const finalProject = finalStatusResponse.data.data;
            console.log('✅ Final project status:');
            console.log(`   - Project Name: ${finalProject.name}`);
            console.log(`   - Current Amount: ${finalProject.currentAmount} XRP`);
            console.log(`   - Target Amount: ${finalProject.targetAmount} XRP`);
            console.log(`   - Status: ${finalProject.status}`);
            console.log(`   - MPT Issuance ID: ${finalProject.mptIssuanceId}`);
            console.log(`   - Total Investors: ${finalProject.investors ? finalProject.investors.size : 0}`);
            console.log(`   - Completed Milestones: ${finalProject.completedMilestones || 0}/${finalProject.milestones.length}`);
        }
        console.log('\n🎉 New Startup Platform Flow Test Completed!');
        console.log('===============================================');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}
// Run the test
testNewStartupFlow().catch(console.error);
//# sourceMappingURL=test-new-startup-flow.js.map