import { Request, Response, NextFunction } from 'express';
/**
 * CORS 미들웨어
 */
export declare const cors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 요청 로거 미들웨어
 */
export declare const requestLogger: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * 에러 처리 미들웨어
 */
export declare const errorHandler: (err: Error, _req: Request, res: Response, _next: NextFunction) => void;
/**
 * 404 처리 미들웨어
 */
export declare const notFound: (req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map