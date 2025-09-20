/**
 * XRPL Core - Main Entry Point
 */

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import { cors as corsMiddleware, requestLogger, errorHandler, notFound } from './api/middleware/auth';
import projectRoutes from './api/routes/projects';
import investmentRoutes from './api/routes/investments';
import tokenRoutes from './api/routes/tokens';
import escrowRoutes from './api/routes/escrows';

dotenv.config();

const app = express();
const PORT = process.env['API_PORT'] || 3000;

// 미들웨어 설정
app.use(helmet());
app.use(corsMiddleware);
app.use(compression());
app.use(morgan('combined'));
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API 라우트
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/escrows', escrowRoutes);

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
app.use(notFound);
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 XRPL Core API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;
