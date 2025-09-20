import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'XRPL ETF Platform API'
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'XRPL ETF Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      etf: '/api/etf',
      portfolio: '/api/portfolio',
      trade: '/api/trade'
    }
  });
});

// ETF routes
app.get('/api/etf', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'ETF 목록이 준비 중입니다.'
  });
});

// Portfolio routes
app.get('/api/portfolio', (req, res) => {
  res.json({
    success: true,
    data: {
      totalValue: 0,
      positions: []
    },
    message: '포트폴리오가 준비 중입니다.'
  });
});

// Trade routes
app.get('/api/trade/history', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: '거래 내역이 준비 중입니다.'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 XRPL ETF Platform API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
});
