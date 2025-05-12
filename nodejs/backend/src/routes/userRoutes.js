import { Router } from 'express';
import { requireAuth, requireAdminOrSelf, requireAdmin } from '../util/authMiddleware.js';

import {
	get_all_users,
	get_user,
	get_user_by_username,
	authenticate,
	update_user,
	create_user,
	delete_user,
	add_reservation
} from '../controllers/userController.js';

const router = Router();

//Open routes
router.post('/auth', authenticate); //JSON payload
router.post("/", create_user); //JSON payload

//Protected routes
router.get('/:userId', requireAuth, requireAdminOrSelf, get_user);
router.put("/:userId", requireAuth, requireAdminOrSelf, update_user); //JSON payload
router.delete("/:userId", requireAuth, requireAdminOrSelf, delete_user);

router.get('/:userId/reservations', requireAuth, requireAdminOrSelf, get_all_user_reservations);
router.post('/:userId/reservations', requireAuth, requireAdminOrSelf, create_reservation); //JSON data

//Protected routes for admin
router.get('/username/:username', requireAuth, requireAdmin, get_user_by_username);
router.get('/', requireAuth, requireAdmin, get_all_users);

export default router;
