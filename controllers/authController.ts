import { NextFunction, Request, Response } from "express";
import ServerError from '../helpers/errorHandler';
import bcrypt from 'bcrypt';
import User from "../models/User";
import passport from "passport";


const SALT_ROUNDS = 10;

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const {email, password} = req.body;
  passport.authenticate('local', function(err, user) {
    try {
      
    if (err) { 
      throw new ServerError(err.message, 401);
    }

    if (!user) { 
     throw new ServerError('Invalid email and password combination', 401);
    }

    req.logIn(email, password, function(err) {
      if (err) { 
        throw new ServerError(err.message, 401);
      }
      return res.send({success: true, user: {email, id: user.id}});
    });

} catch(err) {
  return next(err);
}
})(req, res, next);
}

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const {email, username, password} = req.body;

    try {
      if (!email || !username  || !password) {
        throw new ServerError('Please enter all the required fields to create a new account', 400);
      }

      // validate that user with that email does not yet exist
      const users = await User.findAll({where: {email}});

      if (users.length > 0) {
        throw new ServerError('User with that email address already exists', 400);
      }

      // create hashed password
      const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

      // store new user in database
      await User.create({email, username, password: hashedPassword});

      return res.status(201).send({sucess: true});

    } catch(err) {
      return next(err);
    }
}

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => { 
  req.logout();
  res.status(200).send({success: true});
};
