import express from "express";
const router = express.Router();
import * as pageController from "../controllers/pageController";
import checkAuth from "../middleware/checkAuth";
import isOwner from "../middleware/isOwner";

router.get("/", pageController.getAll);
router.post("/", checkAuth, pageController.create as any);
router.delete("/:slug", checkAuth, isOwner as any, pageController.remove);
router.get("/:slug", pageController.getSingle);

export default router;
