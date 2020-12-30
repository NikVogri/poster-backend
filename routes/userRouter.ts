import express from "express";
import avatarRouter from "./avatarRouter";

const router = express.Router();

router.use("/avatar", avatarRouter);

export default router;
