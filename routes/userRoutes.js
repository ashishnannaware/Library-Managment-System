import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  getUserByUserId,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import {
  userSchema,
  updateUserSchema,
  paginationSchema,
  validate,
  validateQuery,
} from '../middleware/userValidator.js';

const router = express.Router();

// Create a new user
router.post('/', validate(userSchema), createUser);

router.get('/', validateQuery(paginationSchema), getUsers);

router.get('/userId/:userId', getUserByUserId);

router.get('/:id', getUserById);

router.put('/:id', validate(updateUserSchema), updateUser);

router.delete('/:id', deleteUser);

export default router;

