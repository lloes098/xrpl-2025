import { Request, Response, NextFunction } from 'express';

/**
 * CORS 미들웨어
 */
export const cors = (req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * 요청 로거 미들웨어
 */
export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

/**
 * 에러 처리 미들웨어
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong'
  });
};

/**
 * 404 처리 미들웨어
 */
export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
};
