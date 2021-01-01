import express from "express";
import * as pageController from "../controllers/pageController";
import checkAuth from "../middleware/checkAuth";
import onlyOwner from "../middleware/onlyOwner";
import membersRouter from "./membersRouter";
import onlyOwnerAndMembers from "../middleware/onlyOwnerAndMembers";

const router = express.Router();

router.use("/:slug/members", membersRouter);

router.get("/all", checkAuth, pageController.getAll as any);
router.post("/", checkAuth, pageController.create as any);
router.put(
  "/:slug",
  checkAuth,
  onlyOwnerAndMembers as any,
  pageController.update
);
router.delete("/:slug", checkAuth, onlyOwner as any, pageController.remove);
router.get(
  "/:slug",
  checkAuth,
  onlyOwnerAndMembers as any,
  pageController.getSingle
);

export default router;
