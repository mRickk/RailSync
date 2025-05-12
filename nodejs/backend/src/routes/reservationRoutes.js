import { Router } from 'express';
import { requireAuth, requireAdminOrSelf, requireAdmin } from '../util/authMiddleware.js';

const router = Router();

import {
    get_all_reservations,
    get_reservation,
    create_reservation,
    delete_reservation
} from '../controllers/reservationController.js';

//Open routes

//Protected routes

//Protected routes for admin
router.get('/', requireAuth, requireAdmin, get_all_reservations);
router.get('/:reservationId', requireAuth, requireAdmin, get_reservation);

// router.post("/", create_reservation);//JSON data
router.delete("/:reservationId", delete_reservation);

export default router;
