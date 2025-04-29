import { Router } from 'express';
const router = Router();

import {
    get_all_reservations,
    get_reservation,
    create_reservation,
    delete_reservation
} from '../controllers/reservationController.js';

router.get('/', get_all_reservations);
router.get('/:id', get_reservation);
router.post("/", create_reservation);//JSON data
router.delete("/:id", delete_reservation);

export default router;
