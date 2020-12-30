import { NextFunction, Request, Response } from "express";
import { User as UserInterface } from "../interfaces/userInterface";
import { User } from "../database/entity/User";
import UnauthorizedError from "../errors/UnauthorizedError";
import ServerError from "../errors/ServerError";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserInterface;
  }
}

interface UserRequest extends Request {
  user?: UserInterface;
}

const checkAuth = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.session as any;
  try {
    if (!email) {
      throw new UnauthorizedError("", 403);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ServerError();
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default checkAuth;
