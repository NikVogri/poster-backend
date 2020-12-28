import express from "express";
import * as membershipController from "../controllers/membershipController";
import checkAuth from "../middleware/checkAuth";
import isOwner from "../middleware/isOwner";
const router = express.Router();

router.post(
  "/invite/:slug",
  checkAuth,
  isOwner as any,
  membershipController.invite
);

export default router;
