import express from "express";
const router = express.Router();

import { handleRegister , handleLogin, handleLogout, verifyEmail, getCurrentUser, handleResetPwdEmail, handleResetPwd } from "../controllers/authController.js";
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js"

router.post("/register", handleRegister);
router.post("/verifyemail", verifyEmail);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

router.post("/forgetpwd", handleResetPwdEmail);
router.post("/resetpwd", handleResetPwd);


router.get("/me", restrictToLoggedinUserOnly, getCurrentUser);

export default router;