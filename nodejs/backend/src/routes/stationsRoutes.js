import { Router } from 'express';

import {
    get_all_stations
} from '../controllers/stationsController.js';

const router = Router();

router.get('/search', get_all_stations);

export default router;
