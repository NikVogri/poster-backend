import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import "reflect-metadata";
dotenv.config();

// routers
import pageRouter from "./routes/pageRouter";
import authRouter from "./routes/authRouter";
import { __dev__, __prod__, __test__ } from "./config/environment";
import { createConnection } from "typeorm";
import { User } from "./database/entity/User";
import { ForgotPasswordToken } from "./database/entity/ForgotPasswordToken";
import { Page } from "./database/entity/Page";

const app = express();

const main = async () => {
  if (!__test__) {
    await createConnection({
      type: "postgres",
      url: process.env.DATABASE_URL,
      logging: __dev__,
      synchronize: true,
      entities: [User, ForgotPasswordToken, Page],
    }).catch((err) => {
      throw new Error(err);
    });
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

  // ERROR HANDLER
  app.use(
    (
      err: { errors?: any[]; message?: string; statusCode?: number },
      _: Request,
      res: Response,
      _2: any
    ) => {
      let error = {
        code: 500,
        errorMessage: "Something went wrong",
      };

      if (typeof err.errors !== "object" && err.message && err.statusCode) {
        error.errorMessage = err.message;

        if (err.statusCode) {
          error.code = err.statusCode;
        }
      } else if (
        typeof err.errors === "object" &&
        err.errors[0].type === "notNull Violation"
      ) {
        error.code = 400;
        error.errorMessage = "Please specify all the required fields";
      }

      return res
        .status(error.code)
        .send({ success: false, error: error.errorMessage });
    }
  );

  // ROOT
  app.get(
    "/",
    (_, res): RequestHandler => {
      return res.send("Welcome to pager API") as any;
    }
  );
};
main();

export default app;
