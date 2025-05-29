import { Router } from 'express';
import { requireAuth, requireAdmin, requireAdminOrReservationOwner } from '../util/authMiddleware.js';

import {
    get_all_reservations,
    get_reservation,
    delete_reservation
} from '../controllers/reservationsController.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, get_all_reservations);

router.get('/:reservationId', requireAuth, requireAdminOrReservationOwner, get_reservation);
router.delete("/:reservationId", requireAuth, requireAdminOrReservationOwner, delete_reservation);

export default router;