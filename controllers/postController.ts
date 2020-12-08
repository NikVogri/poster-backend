import { Response, Request, NextFunction } from "express";
import ServerError from "../helpers/errorHandler";
import { Post as PostInterface } from "../interfaces/postInterface";
import { User as UserInterface } from "../interfaces/userInterface";
import { generatePostSlug } from "../helpers/generateSlug";
import Post from "../models/Post";
import User from "../models/User";

export const getAll = async (_: Request, res: Response) => {
  const posts = (await Post.findAll({
    order: [["createdAt", "DESC"]],
    include: {
      model: User,
      attributes: ["username", "id", "slug"],
    },
  })) as PostInterface[];
  return res.send({
    success: true,
    posts,
  }) as any;
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user) {
      const { id } = req.user as UserInterface;
      const post = await Post.create({
        ...req.body,
        UserId: id,
        slug: await generatePostSlug(req.body.title),
      });

      return res.send({
        success: true,
        post,
      }) as any;
    } else {
      throw new ServerError();
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      throw new ServerError("Provide id for post to be deleted", 400);
    }

    await Post.destroy({ where: { id: postId } });

    res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const getSingle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      where: { slug },
      include: {
        model: User,
        attributes: ["username", "id", "slug"],
      },
    });

    if (!post) {
      throw new ServerError("Post not found", 404);
    }
    return res.status(200).send({ success: true, post });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
