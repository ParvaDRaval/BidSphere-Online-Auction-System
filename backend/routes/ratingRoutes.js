import express from 'express';
import { rateSeller, getSellerRatings } from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', rateSeller);
router.get('/seller/:sellerId', getSellerRatings);

export default router;