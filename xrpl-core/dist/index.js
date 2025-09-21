"use strict";
/**
 * XRPL Core - Main Entry Point
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./api/middleware/auth");
const projects_1 = __importDefault(require("./api/routes/projects"));
const investments_1 = __importDefault(require("./api/routes/investments"));
const tokens_1 = __importDefault(require("./api/routes/tokens"));
const escrows_1 = __importDefault(require("./api/routes/escrows"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env['API_PORT'] || 3000;
// 미들웨어 설정
app.use((0, helmet_1.default)());
app.use(auth_1.cors);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(auth_1.requestLogger);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// API 라우트
app.use('/api/projects', projects_1.default);
app.use('/api/investments', investments_1.default);
app.use('/api/tokens', tokens_1.default);
app.use('/api/escrows', escrows_1.default);
// 헬스 체크 엔드포인트
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API 정보 엔드포인트
app.get('/api', (_req, res) => {
    res.json({
        name: 'XRPL Core API',
        version: '1.0.0',
        description: 'Decentralized Investment Platform Core Services',
        endpoints: {
            projects: '/api/projects',
            investments: '/api/investments',
            tokens: '/api/tokens',
            escrows: '/api/escrows'
        }
    });
});
// 에러 처리
app.use(auth_1.notFound);
app.use(auth_1.errorHandler);
// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 XRPL Core API server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map