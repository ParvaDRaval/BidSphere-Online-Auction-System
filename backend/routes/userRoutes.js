import express from "express";
const router = express.Router();

import { getWatchlist, addToWatchlist, removeFromWatchlist, getBiddingHistory, updateUserProfile, getMyPayments } from "../controllers/userController.js";
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js"

router.put("/profile", restrictToLoggedinUserOnly, updateUserProfile);

router.get("/watchlist", restrictToLoggedinUserOnly, getWatchlist);
router.post("/watchlist", restrictToLoggedinUserOnly, addToWatchlist);
router.delete("/watchlist/:auctionId", restrictToLoggedinUserOnly, removeFromWatchlist);


router.get("/bidding-history", restrictToLoggedinUserOnly, getBiddingHistory);

router.get("/payments", restrictToLoggedinUserOnly, getMyPayments);

export default router;