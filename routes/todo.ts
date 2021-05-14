import express from "express";
import * as todoController from "../controllers/todo";
import checkAuth from "../middleware/checkAuth";
import onlyOwnerOrMember from "../middleware/onlyOwnerAndMembers";

const router = express.Router({ mergeParams: true });

router.post(
	"/",
	checkAuth,
	onlyOwnerOrMember as any,
	todoController.addNewBlock as any
);
router.put(
	"/:todoId",
	checkAuth,
	onlyOwnerOrMember as any,
	todoController.updateBlock as any
);

router.delete(
	"/:todoId",
	checkAuth,
	onlyOwnerOrMember as any,
	todoController.removeBlock as any
);

router.post(
	"/:todoId/task",
	checkAuth,
	onlyOwnerOrMember as any,
	todoController.addTask
);

router.put(
	"/:todoId/task",
	checkAuth,
	onlyOwnerOrMember as any,
	todoController.updateTask
);

export default router;
