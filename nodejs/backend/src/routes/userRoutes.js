import { Router } from 'express';
import { requireAuth, requireAdminOrSameUserId, requireAdmin } from '../util/authMiddleware.js';

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
router.get('/:id', requireAuth, requireAdminOrSameUserId, get_user);
router.put("/:id", requireAuth, requireAdminOrSameUserId, update_user); //JSON payload
router.delete("/:id", requireAuth, requireAdminOrSameUserId, delete_user);
router.put("/reservation/:id", requireAuth, requireAdminOrSameUserId, add_reservation); //JSON payload

//Protected routes for admin
router.get('/username/:username', requireAuth, requireAdmin, get_user_by_username);
router.get('/', requireAuth, requireAdmin, get_all_users);

export default router;
