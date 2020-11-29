import { NextFunction, Request, Response } from "express";
import ServerError from '../helpers/errorHandler';
import bcrypt from 'bcrypt';
import User from "../models/User";
import passport from "passport";
import generateUniqueSlug from "../helpers/generateSlug";
import {User as UserInterface} from '../interfaces/userInterface';
import passwordValidator from "../helpers/passwordValidator";


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

      const timeNow = new Date().getTime();
      const maxCookieAge = new Date(timeNow + 1000 * 60 * 60 * 24 * 7) // 7 days;

      return res.send({success: true, maxCookieAge, user: {email, id: user.id}});
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
      const slug = await generateUniqueSlug(username);
      await User.create({email, username, password: hashedPassword, slug});

      return res.status(201).send({sucess: true});

    } catch(err) {
      console.log(err)
      return next(err);
    }
}

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => { 
  req.logout();
  res.status(200).send({success: true});
};


export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.user as UserInterface;
  const { password, newPassword } = req.body;
 try {
   const user = await User.findOne({where: {id}});

   if (!user) {
      throw new ServerError();
   }

   if (!passwordValidator(password, user.password)) {
     throw new ServerError('Old password is incorrect', 400);
   }

   const hashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
   await user.update({password: hashedPassword});

   res.status(200).send({success: true, msg: 'Password changed successfully'});
 } catch(err) {
   console.log(err)
   return next(err);
 }

  
}