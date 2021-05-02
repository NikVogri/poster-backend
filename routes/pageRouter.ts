import express from "express";
import * as pageController from "../controllers/pageController";
import checkAuth from "../middleware/checkAuth";
import onlyOwner from "../middleware/onlyOwner";
import membersRouter from "./membersRouter";
import onlyOwnerAndMembers from "../middleware/onlyOwnerAndMembers";

const router = express.Router();

router.use("/:id/members", membersRouter);

router.get("/all", checkAuth, pageController.getAll as any);
router.get("/other-pages", checkAuth, pageController.getOtherPages as any);
router.post("/", checkAuth, pageController.create as any);
// router.put(
// 	"/:id",
// 	checkAuth,
// 	onlyOwnerAndMembers as any,
// 	pageController.update
// );

router.delete(
	"/:id",
	checkAuth,
	onlyOwner as any,
	pageController.remove as any
);

router.get(
	"/:id",
	checkAuth,
	onlyOwnerAndMembers as any,
	pageController.getSingle
);

router.get(
	"/:id/todos",
	checkAuth,
	onlyOwnerAndMembers as any,
	pageController.getPageTodos as any
);

router.put(
	"/:id/update-banner",
	checkAuth,
	onlyOwnerAndMembers as any,
	pageController.updateBanner as any
);

export default router;
