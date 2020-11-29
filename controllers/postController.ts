import { Response, Request, NextFunction } from 'express';
import ServerError from '../helpers/errorHandler';
import { Post as PostInterface } from '../interfaces/postInterface';
import { User } from '../interfaces/userInterface';
import Post from '../models/Post';

export const getAll = async (_: Request, res: Response) => {
  const posts = await Post.findAll() as PostInterface[];
 return res.send({
    success: true,
    posts
  }) as any;
};

export const create = async (req: Request, res: Response, next: NextFunction)=> {
  try { 
    if (req.user) {
      const {id} = req.user as User;
      const post = await Post.create({...req.body, UserId: id});
      
      return res.send({
        success: true,
        post
      }) as any;

    } else {
      throw new ServerError();
    }

  } catch(err) {
   return next(err);
  }

};
