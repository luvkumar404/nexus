import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { preview, status } from '../controllers/audit.controller.js';
import { validateUrl } from '../middleware/validateUrl.middleware.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();
const crawlerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, standardHeaders: true, legacyHeaders: false });

router.post('/preview', crawlerLimiter, validateUrl, asyncHandler(preview));
router.get('/status/:auditId', asyncHandler(status));

export default router;
