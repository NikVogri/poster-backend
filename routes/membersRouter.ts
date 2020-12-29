import express from "express";
import * as membershipController from "../controllers/membershipController";
import checkAuth from "../middleware/checkAuth";
import isOwner from "../middleware/isOwner";
const router = express.Router({ mergeParams: true });

router.post(
  "/add",
  checkAuth,
  isOwner as any,
  membershipController.inviteMember
);

router.get("/", checkAuth, isOwner as any, membershipController.getMembers);

router.delete(
  "/remove",
  checkAuth,
  isOwner as any,
  membershipController.removeMember
);

export default router;
