import express from 'express';
import { rateSeller, getSellerRatings, updateRating, deleteRating } from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', rateSeller);
router.get('/seller/:sellerId', getSellerRatings);
router.put('/:id', updateRating);
router.delete('/:id', deleteRating);
export default router;