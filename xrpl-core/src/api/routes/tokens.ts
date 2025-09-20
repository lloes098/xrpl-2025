import { Router, Request, Response } from 'express';

const router = Router();

/**
 * 토큰 목록 조회
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Tokens endpoint - coming soon',
    data: []
  });
});

/**
 * 토큰 생성
 */
router.post('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Token creation - coming soon',
    data: null
  });
});

/**
 * 특정 토큰 조회
 */
router.get('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Token details - coming soon',
    data: { id: req.params['id'] }
  });
});

export default router;
