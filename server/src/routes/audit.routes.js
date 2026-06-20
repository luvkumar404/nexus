import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { deleteAudit, getAudit, getAuditPdf, getProjectAudits, startAudit } from '../controllers/audit.controller.js';
import { validateUrl } from '../middleware/validateUrl.middleware.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();
const auditLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });

router.post('/start', auditLimiter, validateUrl, asyncHandler(startAudit));
router.get('/project/:projectId', asyncHandler(getProjectAudits));
router.get('/:auditId/pdf', asyncHandler(getAuditPdf));
router.get('/:auditId', asyncHandler(getAudit));
router.delete('/:auditId', asyncHandler(deleteAudit));

export default router;
