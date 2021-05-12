import express from "express";
import avatarRouter from "./avatar";

const router = express.Router();

router.use("/avatar", avatarRouter);

export default router;
