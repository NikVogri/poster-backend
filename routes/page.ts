import express from "express";
import * as pageController from "../controllers/page";
import checkAuth from "../middleware/checkAuth";
import onlyOwner from "../middleware/onlyOwner";

import membersRouter from "./members";
import todoRouter from "./todo";
import notebookRouter from "./notebook";

import onlyOwnerAndMembers from "../middleware/onlyOwnerAndMembers";

const router = express.Router();

router.use("/:id/members", membersRouter);
router.use("/:id/todos", todoRouter);

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
