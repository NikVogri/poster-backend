import express from "express";
import * as avatarController from "../controllers/avatar";
import multer from "multer";
import checkAuth from "../middleware/checkAuth";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/add",
  checkAuth,
  upload.single("avatar"),
  avatarController.setAvatar as any
);

export default router;
