import { Router } from 'express';
const router = Router();

import {
	get_all_users,
	get_user,
	authenticate,
	update_user,
	create_user,
	delete_user
} from '../controllers/userController.js';

// These routes will be prefixed with /users or similar in the main app
router.get('/', get_all_users);
router.get('/:id', get_user);
router.post('/authenticate', authenticate);//JSON data
router.put("/:id", update_user);//JSON data
router.post("/", create_user);//JSON data
router.delete("/:id", delete_user);

export default router;
