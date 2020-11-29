import { NextFunction, Request, Response } from "express";

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send({success: false, msg: 'Not Allowed'});
  }
}

export default checkAuth;