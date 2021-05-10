import express from "express";
import * as todoController from "../controllers/todoController";
import checkAuth from "../middleware/checkAuth";
import onlyOwnerOrMember from "../middleware/onlyOwnerAndMembers";

const router = express.Router({ mergeParams: true });

router.post(
	"/add-todo-block",
	checkAuth,
	onlyOwnerOrMember as any,
	todoController.addNewBlock as any
);
// router.post("/add-todo-task", todoController.);
// router.put("/toggle-task", todoController.);

export default router;
