import { NextFunction, Request, Response } from "express";
import ServerError from "../helpers/errorHandler";
import { User as UserInterface } from "../interfaces/userInterface";
import { User } from "../database/entity/User";

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

  if (email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ServerError();
    }

    req.user = user;
    next();
  } else {
    res.status(403).send({ success: false, msg: "Not Allowed" });
  }
};

export default checkAuth;
