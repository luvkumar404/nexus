import { Router } from 'express';
import { createProject, deleteProject, getProject, listProjects } from '../controllers/project.controller.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();
router.post('/', asyncHandler(createProject));
router.get('/', asyncHandler(listProjects));
router.get('/:id', asyncHandler(getProject));
router.delete('/:id', asyncHandler(deleteProject));
export default router;
