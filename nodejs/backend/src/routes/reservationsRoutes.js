import { Router } from 'express';

import {
    requireAuth,
    requireAdmin,
    requireAdminOrReservationOwner
} from '../util/authMiddleware.js';

import {
    get_all_reservations,
    get_reservation,
    delete_reservation,
    get_occupied_seats
} from '../controllers/reservationsController.js';

import {
    getSelectedSeats,
    createOrRenewLock,
    deleteLock
} from '../controllers/redisController.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, get_all_reservations);

router.get('/:solutionId/selectedSeats',
    requireAuth,
    getSelectedSeats);
router.post('/:solutionId/select',
    requireAuth,
    createOrRenewLock); // { trainId, seat }
router.delete('/:solutionId/unselect/:trainId/:seat',
    requireAuth,
    deleteLock);

router.get('/:reservationId', requireAuth, requireAdminOrReservationOwner, get_reservation);
router.delete("/:reservationId", requireAuth, requireAdminOrReservationOwner, delete_reservation);
router.get('/:solutionId/occupiedSeats', requireAuth, get_occupied_seats);

export default router;