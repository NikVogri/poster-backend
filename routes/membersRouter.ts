import express from "express";
import * as membershipController from "../controllers/membershipController";
import checkAuth from "../middleware/checkAuth";
import onlyOwner from "../middleware/onlyOwner";
import onlyMembers from "../middleware/onlyMembers";

const router = express.Router({ mergeParams: true });

router.post(
  "/add",
  checkAuth,
  onlyOwner as any,
  membershipController.inviteMember
);

router.get("/", checkAuth, onlyOwner as any, membershipController.getMembers);

router.delete(
  "/remove",
  checkAuth,
  onlyOwner as any,
  membershipController.removeMember
);

router.post(
  "/leave",
  checkAuth,
  onlyMembers as any,
  membershipController.leave as any
);

export default router;
