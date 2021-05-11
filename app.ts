import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import "reflect-metadata";
import cloudinary from "cloudinary";

// routers
import pageRouter from "./routes/pageRouter";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import todoRouter from "./routes/todoRouter";

import { __dev__, __prod__, __test__ } from "./config/environment";
import { createConnection } from "typeorm";
import { User } from "./database/entity/User";
import { ForgotPasswordToken } from "./database/entity/ForgotPasswordToken";
import { Page } from "./database/entity/Page";

import errorHandler from "./middleware/errorHandler";
import { Notebook } from "./database/entity/Notebook";
import { NotebookBlock } from "./database/entity/NotebookBlock";
import { Todo } from "./database/entity/Todo";
import { TodoItem } from "./database/entity/TodoItem";

const app = express();

if (__test__) {
	dotenv.config({ path: "./.env.test" });
} else {
	dotenv.config();
}

const main = async () => {
	if (!__test__) {
		await createConnection({
			type: "postgres",
			url: process.env.DATABASE_URL,
			logging: __dev__,
			synchronize: true,
			entities: [
				User,
				ForgotPasswordToken,
				Page,
				Notebook,
				NotebookBlock,
				Todo,
				TodoItem,
			],
		}).catch((err) => {
			throw new Error(err);
		});
	}

	if (
		!process.env.CLOUDINARY_API_KEY ||
		!process.env.CLOUDINARY_API_SECRET ||
		!process.env.CLOUDINARY_CLOUD_NAME
	) {
		throw new Error(
			"Provide cloudinary credentials (api key and secret) and cloud name"
		);
	}

	if (!process.env.SESSION_SECRET) {
		throw new Error("Provide session secret");
	}

	if (
		!process.env.EMAIL_HOST ||
		!process.env.EMAIL_PORT ||
		!process.env.EMAIL_USER ||
		!process.env.EMAIL_PASSWORD
	) {
		throw new Error("Provide email provider host, port, user and password");
	}

	app.set("trust proxy", 1);

	// INIT CLOUDINARY
	cloudinary.v2.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});

	// MIDDLEWARE
	app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(
		session({
			resave: false,
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET,
			cookie: {
				maxAge: 1000 * 60 * 24 * 7,
				sameSite: "lax",
				httpOnly: true,
				secure: __prod__,
				domain: __prod__ ? "mipage.live" : undefined,
			},
		})
	);

	//ROUTERS
	app.use("/api/v1/pages", pageRouter);
	app.use("/api/v1/auth", authRouter);
	app.use("/api/v1/user", userRouter);
	app.use("/api/v1/todo", todoRouter);

	// ERROR HANDLER
	app.use(errorHandler as any);

	// ROOT
	app.get("/", (_, res): RequestHandler => {
		return res.send("Welcome to pager API") as any;
	});
};
main();

export default app;
