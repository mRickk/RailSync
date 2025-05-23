import { Router } from 'express';

import {
    get_solutions
} from '../controllers/solutionsController.js';

const router = Router();

router.get('/', get_solutions);

export default router;
