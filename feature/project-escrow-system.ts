import { MPTokenManager } from "./Features/MPTokens";
import { EscrowCore } from "./Features/EscrowCore";

/**
 * 프로젝트별 독립적인 MPT 에스크로 시스템
 * 
 * 시스템 구조:
 * 1. Admin: MPT 발행만 담당 (에스크로 불가)
 * 2. Users: 에스크로 생성/관리 담당
 * 3. 각 프로젝트마다 독자적인 MPT 발행
 * 4. 목표 금액 달성시 자동 에스크로 해제
 * 5. 목표 금액 미달성시 에스크로 취소 (돈 반환)
 */

interface ProjectConfig {
    projectId: string;
    projectName: string;
    targetAmount: string;        // 목표 금액
    deadlineHours: number;       // 마감 시간 (시간)
    escrowDurationMinutes: number; // 에스크로 지속 시간 (분)
}

interface EscrowProject {
    projectId: string;
    issuanceId: string;
    targetAmount: string;
    currentAmount: string;
    deadline: Date;
    escrows: Array<{
        userAddress: string;
        amount: string;
        sequence: number;
        createdAt: Date;
    }>;
    status: 'active' | 'completed' | 'cancelled';
}

class ProjectEscrowSystem {
    private adminSeed: string;
    private userSeeds: string[];
    private projects: Map<string, EscrowProject> = new Map();
    private mptManager: MPTokenManager;
    private escrowCore: EscrowCore;
    private checkInterval: NodeJS.Timeout | null = null;

    constructor(adminSeed: string, userSeeds: string[]) {
        this.adminSeed = adminSeed;
        this.userSeeds = userSeeds;
        this.mptManager = new MPTokenManager(adminSeed);
        this.escrowCore = new EscrowCore(adminSeed, userSeeds[0], userSeeds[1]);
    }

    async connect(): Promise<void> {
        await this.mptManager.connect();
        await this.escrowCore.connect();
        console.log("✅ 프로젝트 에스크로 시스템 연결 완료");
    }

    async disconnect(): Promise<void> {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        await this.mptManager.disconnect();
        await this.escrowCore.disconnect();
        console.log("🔌 연결 해제 완료");
    }

    /**
     * 새 프로젝트 생성 (Admin만 가능)
     */
    async createProject(config: ProjectConfig): Promise<string> {
        console.log(`\n📝 프로젝트 생성: ${config.projectName}`);
        
        // 1. 프로젝트별 독자적인 MPT 발행
        const tokenInfo = {
            name: `${config.projectName} Token`,
            ticker: config.projectId.toUpperCase(),
            description: `프로젝트 ${config.projectName}을 위한 독립적인 토큰`,
            decimals: 2,
            total_supply: "10000000", // 10,000,000 units (하드코딩)
            asset_class: "other",     // 하드코딩: 표준 asset_class 사용
            icon: "https://xrpl.org/assets/favicon.16698f9bee80e5687493ed116f24a6633bb5eaa3071414d64b3bed30c3db1d1d.8a5edab2.ico", // 하드코딩: 기본 아이콘
            use_case: "Project funding", // 하드코딩: 프로젝트 펀딩용
            issuer_name: "Project Admin"  // 하드코딩: 발행자명
        };
        const metadata = Buffer.from(JSON.stringify(tokenInfo)).toString('hex');

        const { issuanceId } = await this.mptManager.createIssuance(
            0,                    // 소수점 자릿수 (하드코딩)
            "10000000",          // 최대 발행량 (하드코딩)
            {                    // 플래그 설정 (하드코딩)
                tfMPTCanTransfer: true,    // 전송 가능
                tfMPTCanEscrow: true,      // 에스크로 가능
                tfMPTRequireAuth: false    // 권한 요구 안함
            },
            metadata
        );

        // 2. 프로젝트 정보 저장
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + config.deadlineHours);

        const project: EscrowProject = {
            projectId: config.projectId,
            issuanceId,
            targetAmount: config.targetAmount,
            currentAmount: "0",
            deadline,
            escrows: [],
            status: 'active'
        };

        this.projects.set(config.projectId, project);

        console.log(`✅ 프로젝트 생성 완료!`);
        console.log(`   프로젝트 ID: ${config.projectId}`);
        console.log(`   토큰 ID: ${issuanceId}`);
        console.log(`   목표 금액: ${config.targetAmount} ${config.projectId.toUpperCase()}`);
        console.log(`   마감 시간: ${deadline.toLocaleString()}`);

        return issuanceId;
    }

    /**
     * 사용자가 프로젝트에 참여 (에스크로 생성)
     */
    async participateInProject(
        projectId: string, 
        userSeed: string, 
        amount: string
    ): Promise<void> {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new Error(`프로젝트 ${projectId}를 찾을 수 없습니다.`);
        }

        if (project.status !== 'active') {
            throw new Error(`프로젝트 ${projectId}는 더 이상 활성화되지 않았습니다.`);
        }

        if (new Date() > project.deadline) {
            throw new Error(`프로젝트 ${projectId}의 마감 시간이 지났습니다.`);
        }

        console.log(`\n💰 사용자 참여: 프로젝트 ${projectId}`);
        console.log(`   참여 금액: ${amount} ${projectId.toUpperCase()}`);

        // 사용자 지갑 생성
        const userWallet = require("xrpl").Wallet.fromSeed(userSeed);
        
        // 1. 사용자가 MPT에 Opt-in
        const userMPTManager = new MPTokenManager(this.adminSeed, userSeed);
        await userMPTManager.connect();
        
        try {
            await userMPTManager.optIn(project.issuanceId);
            console.log(`   ✅ Opt-in 완료: ${userWallet.address}`);
        } catch (error) {
            console.log(`   ⚠️ Opt-in 실패 (이미 참여했을 수 있음): ${error instanceof Error ? error.message : String(error)}`);
        }

        // 2. Admin이 사용자에게 토큰 발급 (하드코딩: 참여 금액만큼 발급)
        await this.mptManager.sendMPT(project.issuanceId, userWallet.address, amount);
        console.log(`   ✅ 토큰 발급 완료: ${amount} ${projectId.toUpperCase()}`);

        // 3. 사용자가 에스크로 생성
        const escrowDuration = 60; // 하드코딩: 60분 후 취소 가능
        const { sequence } = await this.escrowCore.createEscrow(
            project.issuanceId,
            amount,
            userWallet.address,  // 자기 자신에게 (임시)
            project.deadline.getTime() / 1000, // 마감 시간에 해제 가능
            (project.deadline.getTime() / 1000) + (escrowDuration * 60) // 마감 + 60분 후 취소 가능
        );

        // 4. 에스크로 정보 저장
        project.escrows.push({
            userAddress: userWallet.address,
            amount,
            sequence,
            createdAt: new Date()
        });

        // 5. 현재 모인 금액 업데이트
        const currentAmount = BigInt(project.currentAmount) + BigInt(amount);
        project.currentAmount = currentAmount.toString();

        console.log(`   ✅ 에스크로 생성 완료!`);
        console.log(`   현재 모인 금액: ${project.currentAmount} / ${project.targetAmount} ${projectId.toUpperCase()}`);

        await userMPTManager.disconnect();
    }

    /**
     * 프로젝트 상태 확인 및 자동 처리
     */
    async checkProjectStatus(projectId: string): Promise<void> {
        const project = this.projects.get(projectId);
        if (!project || project.status !== 'active') {
            return;
        }

        const now = new Date();
        const isDeadlinePassed = now > project.deadline;
        const isTargetReached = BigInt(project.currentAmount) >= BigInt(project.targetAmount);

        console.log(`\n📊 프로젝트 ${projectId} 상태 확인:`);
        console.log(`   현재 금액: ${project.currentAmount} / ${project.targetAmount}`);
        console.log(`   마감 시간: ${project.deadline.toLocaleString()}`);
        console.log(`   목표 달성: ${isTargetReached ? '✅' : '❌'}`);
        console.log(`   마감 여부: ${isDeadlinePassed ? '✅' : '❌'}`);

        if (isDeadlinePassed) {
            if (isTargetReached) {
                // 목표 달성: 모든 에스크로 해제
                await this.completeProject(projectId);
            } else {
                // 목표 미달성: 모든 에스크로 취소
                await this.cancelProject(projectId);
            }
        }
    }

    /**
     * 프로젝트 완료 (목표 달성)
     */
    private async completeProject(projectId: string): Promise<void> {
        const project = this.projects.get(projectId);
        if (!project) return;

        console.log(`\n🎉 프로젝트 ${projectId} 목표 달성! 모든 에스크로 해제 중...`);

        for (const escrow of project.escrows) {
            try {
                // 하드코딩: 에스크로 해제시 토큰을 프로젝트 수집 주소로 전송
                // (실제로는 프로젝트 관리자나 특정 주소로 전송)
                const projectCollectionAddress = this.escrowCore.getAddresses().admin; // 하드코딩: Admin 주소로 수집
                
                await this.escrowCore.finishEscrow(escrow.userAddress, escrow.sequence);
                console.log(`   ✅ 에스크로 해제: ${escrow.userAddress} (${escrow.amount})`);
            } catch (error) {
                console.log(`   ❌ 에스크로 해제 실패: ${escrow.userAddress} - ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        project.status = 'completed';
        console.log(`✅ 프로젝트 ${projectId} 완료 처리됨`);
    }

    /**
     * 프로젝트 취소 (목표 미달성)
     */
    private async cancelProject(projectId: string): Promise<void> {
        const project = this.projects.get(projectId);
        if (!project) return;

        console.log(`\n❌ 프로젝트 ${projectId} 목표 미달성! 모든 에스크로 취소 중...`);

        for (const escrow of project.escrows) {
            try {
                await this.escrowCore.cancelEscrow(escrow.userAddress, escrow.sequence);
                console.log(`   ✅ 에스크로 취소: ${escrow.userAddress} (${escrow.amount} 반환)`);
            } catch (error) {
                console.log(`   ❌ 에스크로 취소 실패: ${escrow.userAddress} - ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        project.status = 'cancelled';
        console.log(`✅ 프로젝트 ${projectId} 취소 처리됨`);
    }

    /**
     * 자동 모니터링 시작
     */
    startMonitoring(): void {
        console.log("🔄 프로젝트 자동 모니터링 시작...");
        
        this.checkInterval = setInterval(async () => {
            for (const projectId of this.projects.keys()) {
                await this.checkProjectStatus(projectId);
            }
        }, 30000); // 하드코딩: 30초마다 체크
    }

    /**
     * 프로젝트 목록 조회
     */
    getProjects(): EscrowProject[] {
        return Array.from(this.projects.values());
    }
}

// ========================================
// 사용 예제
// ========================================

async function runProjectEscrowDemo() {
    console.log("🚀 === 프로젝트 에스크로 시스템 데모 시작 ===");
    
    // 하드코딩된 설정값들
    const ADMIN_SEED = "sEdS15TBrTKUzNaKnmD1sWJfBiMvaHc";  // 하드코딩: Admin 시드
    const USER_SEEDS = [                                    // 하드코딩: 사용자 시드들
        "sEd7W8Zc3QRsmHTJv4PoKT3BBMxYnzW",
        "sEdVFeW3aqETMKYc7z9pUToiBuaPD4V"
    ];
    
    const system = new ProjectEscrowSystem(ADMIN_SEED, USER_SEEDS);
    
    try {
        await system.connect();
        
        // 1. 프로젝트 생성
        const project1 = await system.createProject({
            projectId: "GAME",                    // 하드코딩: 게임 프로젝트
            projectName: "Blockchain Game",       // 하드코딩: 프로젝트명
            targetAmount: "10000",               // 하드코딩: 목표 금액
            deadlineHours: 1,                    // 하드코딩: 1시간 후 마감
            escrowDurationMinutes: 60            // 하드코딩: 60분 에스크로 지속
        });
        
        const project2 = await system.createProject({
            projectId: "NFT",                     // 하드코딩: NFT 프로젝트
            projectName: "NFT Collection",        // 하드코딩: 프로젝트명
            targetAmount: "5000",                // 하드코딩: 목표 금액
            deadlineHours: 2,                    // 하드코딩: 2시간 후 마감
            escrowDurationMinutes: 120           // 하드코딩: 120분 에스크로 지속
        });
        
        // 2. 사용자들이 프로젝트에 참여
        console.log("\n👥 사용자들이 프로젝트에 참여 중...");
        
        // 사용자1이 게임 프로젝트에 참여
        await system.participateInProject("GAME", USER_SEEDS[0], "3000");
        
        // 사용자2가 게임 프로젝트에 참여
        await system.participateInProject("GAME", USER_SEEDS[1], "4000");
        
        // 사용자1이 NFT 프로젝트에 참여
        await system.participateInProject("NFT", USER_SEEDS[0], "2000");
        
        // 3. 자동 모니터링 시작
        system.startMonitoring();
        
        // 4. 수동으로 상태 확인 (테스트용)
        console.log("\n📊 프로젝트 상태 확인:");
        const projects = system.getProjects();
        for (const project of projects) {
            console.log(`   ${project.projectId}: ${project.currentAmount}/${project.targetAmount} (${project.status})`);
        }
        
        // 5. 대기 (실제로는 자동 모니터링이 처리)
        console.log("\n⏳ 자동 모니터링 중... (Ctrl+C로 종료)");
        
        // 데모를 위해 2분 대기 후 수동 체크
        await new Promise(resolve => setTimeout(resolve, 120000));
        
        console.log("\n🔍 수동 상태 체크:");
        await system.checkProjectStatus("GAME");
        await system.checkProjectStatus("NFT");
        
    } catch (error) {
        console.error("❌ 시스템 실행 실패:", error);
    } finally {
        await system.disconnect();
    }
}

// 실행
runProjectEscrowDemo();
