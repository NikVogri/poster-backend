import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import sequelize from "./helpers/database";

// routers
import postsRouter from "./routes/postsRouter";
import authRouter from "./routes/authRouter";

const PORT = process.env.PORT || 5000;

const app = express();

if (!process.env.SESSION_SECRET) {
  throw new Error("Provide session secret");
}
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
  })
);

//ROUTERS
app.use("/api/v1/posts", postsRouter);
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

    console.log(error);

    return res
      .status(error.code)
      .send({ success: false, error: error.errorMessage });
  }
);

// ROOT
app.get(
  "/",
  (_, res): RequestHandler => {
    return res.send("Welcome to poster API") as any;
  }
);

app.listen(PORT, async () => {
  // Make sure sequelize is connected correctly
  await sequelize.authenticate();
  console.log("Server started on port " + PORT);
});
