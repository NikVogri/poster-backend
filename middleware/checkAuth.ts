import { NextFunction, Request, Response } from "express";
import ServerError from "../helpers/errorHandler";
import { User as UserInterface } from "../interfaces/userInterface";
import User from "../models/User";

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    const user: UserInterface | any = await User.findOne({where: {email: req.user}});

    if (!user) {
      throw new ServerError();
    }

    req.user = user as UserInterface;
    next();
  } else {
    res.status(403).send({success: false, msg: 'Not Allowed'});
  }
}

export default checkAuth;