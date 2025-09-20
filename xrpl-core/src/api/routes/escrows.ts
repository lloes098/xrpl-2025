import { Router, Request, Response } from 'express';

const router = Router();

/**
 * 에스크로 목록 조회
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Escrows endpoint - coming soon',
    data: []
  });
});

/**
 * 에스크로 생성
 */
router.post('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Escrow creation - coming soon',
    data: null
  });
});

/**
 * 특정 에스크로 조회
 */
router.get('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Escrow details - coming soon',
    data: { id: req.params['id'] }
  });
});

export default router;
