import express from "express";

import * as auth from "../controllers/authController";
import checkAuth from "../middleware/checkAuth";

const router = express.Router();

router.post("/login", auth.loginUser as any);
router.post("/register", auth.registerUser as any);
router.post("/logout", auth.logoutUser as any);
router.post("/change-password", checkAuth, auth.changePassword as any);
router.get("/me", checkAuth, auth.me as any);

router.post("/forgot-password", auth.forgotPassword as any);
router.post("/reset-password", auth.resetPassword as any);

// router.post('/forgot-password');

export default router;
