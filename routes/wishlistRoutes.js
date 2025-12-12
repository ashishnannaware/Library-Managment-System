import express from 'express';
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  checkWishlist,
  getAllWishlists,
} from '../controllers/wishlistController.js';
import {
  addWishlistSchema,
  validate,
} from '../middleware/wishlistValidator.js';

const router = express.Router();

router.post('/', validate(addWishlistSchema), addToWishlist);

router.get('/', getAllWishlists);

router.get('/check', checkWishlist);

router.get('/user/:userId', getUserWishlist);

router.delete('/user/:userId/book/:bookId', removeFromWishlist);

export default router;

