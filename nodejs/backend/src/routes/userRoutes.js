import { Router } from 'express';
import { requireAuth, requireAdminOrSelf, requireAdmin } from '../util/authMiddleware.js';

import {
	search_users,
	get_user,
	authenticate,
	update_user,
	create_user,
	delete_user
} from '../controllers/userController.js';

import {
	get_all_user_reservations,
	create_reservation
} from '../controllers/reservationController.js';

const router = Router();

router.post('/auth', authenticate); //JSON username, password

router.post("/", create_user); //JSON User
router.get('/', requireAuth, requireAdmin, search_users);

router.get('/:userId', requireAuth, requireAdminOrSelf, get_user);
router.patch("/:userId", requireAuth, requireAdminOrSelf, update_user); //JSON User
router.delete("/:userId", requireAuth, requireAdminOrSelf, delete_user);

router.get('/:userId/reservations', requireAuth, requireAdminOrSelf, get_all_user_reservations);
router.post('/:userId/reservations', requireAuth, requireAdminOrSelf, create_reservation); //JSON Reservation

export default router;
