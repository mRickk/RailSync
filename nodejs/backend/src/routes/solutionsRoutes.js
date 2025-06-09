import { Router } from 'express';
import { requireAdmin, requireAuth } from '../util/authMiddleware.js';

import {
    get_solutions,
    get_solution,
    clearUnusedSolutions,
} from '../controllers/solutionsController.js';

const router = Router();

router.get('/', requireAuth, get_solutions);
router.get('/:solutionId', requireAuth, get_solution);
router.delete('/', requireAuth, requireAdmin, clearUnusedSolutions);

export default router;
