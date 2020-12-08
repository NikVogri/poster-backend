import express from "express";
const router = express.Router();
import * as postController from "../controllers/postController";
import checkAuth from "../middleware/checkAuth";
import isOwner from "../middleware/isOwner";

router.get("/", postController.getAll);
router.post("/", checkAuth, postController.create);
router.delete("/:postId", checkAuth, isOwner, postController.remove);
router.get("/:slug", postController.getSingle);

export default router;
