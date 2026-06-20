import { Router } from 'express';
import { debugCrawl } from '../controllers/audit.controller.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();

router.get('/crawl', asyncHandler(debugCrawl));

export default router;
