import express from "express";
import * as pageController from "../controllers/pageController";
import checkAuth from "../middleware/checkAuth";
import isOwner from "../middleware/isOwner";
import membersRouter from "./membersRouter";

const router = express.Router();

router.use("/:slug/members", membersRouter);

router.get("/all", checkAuth, pageController.getAll as any);
router.post("/", checkAuth, pageController.create as any);
router.put("/:slug", checkAuth, isOwner as any, pageController.update);
router.delete("/:slug", checkAuth, isOwner as any, pageController.remove);
router.get("/:slug", pageController.getSingle);

export default router;
