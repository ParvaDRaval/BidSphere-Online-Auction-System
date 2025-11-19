import express from "express";
const router = express.Router();

import { handleRegister , handleLogin, handleLogout, verifyEmail, getCurrentUser, handleResetPwdEmail, handleResetPwd } from "../controllers/authController.js";
import { checkAuth } from "../middleware/authMiddleware.js";
// add user controller
import { getWatchlist, addToWatchlist, removeFromWatchlist, getBiddingHistory, updateUserProfile } from "../controllers/userController.js";
import { getMyPayments } from "../controllers/paymentController.js";

router.post("/register", handleRegister);
router.post("/verifyemail", verifyEmail);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

// GET /bidsphere/user/me - returns current user based on session cookie (token)
router.get("/me", checkAuth, getCurrentUser);
router.post("/forgetpwd", handleResetPwdEmail);
router.post("/resetpwd", handleResetPwd);

// watchlist & bidding history
router.get("/watchlist", checkAuth, getWatchlist);
router.post("/watchlist", checkAuth, addToWatchlist);
router.delete("/watchlist/:auctionId", checkAuth, removeFromWatchlist);

// bidding history
router.get("/bidding-history", checkAuth, getBiddingHistory);

// User payments (winning payments created by this user)
router.get("/payments", checkAuth, getMyPayments);

// Update user profile
router.put("/profile", checkAuth, updateUserProfile);

export default router;