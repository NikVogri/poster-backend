import { Response, Request, NextFunction } from 'express';
import { Model } from 'sequelize';
import { PostInterface } from '../interfaces/postInterface';
import Post from '../models/Post';

export const getAll = async (_: Request, res: Response) => {
  const posts = await Post.findAll() as Model <PostInterface>[];
 return res.send({
    success: true,
    posts
  }) as any;
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const post: PostInterface = {...req.body};

  try {
   await Post.create(post);
  } catch(err) {
   return next(err);
  }
  
  return res.send({
    success: true,
    post
  }) as any;
};
