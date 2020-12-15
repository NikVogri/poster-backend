import express from "express";

import * as auth from "../controllers/authController";
import checkAuth from "../middleware/checkAuth";

const router = express.Router();

router.post("/login", auth.loginUser);
router.post("/register", auth.registerUser);
router.post("/logout", auth.logoutUser);
router.post("/change-password", checkAuth, auth.changePassword as any);
router.get("/me", checkAuth, auth.me as any);

// router.post('/forgot-password');

export default router;
