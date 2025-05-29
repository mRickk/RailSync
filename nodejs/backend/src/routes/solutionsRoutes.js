import { Router } from 'express';
import { requireAuth } from '../util/authMiddleware.js';

import {
    get_solutions,
    get_solution,   
} from '../controllers/solutionsController.js';

const router = Router();

router.get('/', requireAuth, get_solutions);
router.get('/:solutionId', requireAuth, get_solution);

export default router;
