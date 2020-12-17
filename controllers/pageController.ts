import { Response, NextFunction, Request } from "express";
import ServerError from "../helpers/errorHandler";
import { UserRequest } from "../interfaces/expressInterface";
import { generatePageSlug } from "../helpers/generateSlug";
import Page from "../models/Page";
import User from "../models/User";

export const getAll = async (req: Request, res: Response) => {
  const { UserId } = req.params;

  const pages = await Page.findAll({
    where: { deleted: false, UserId },
    order: [["createdAt", "DESC"]],
    include: {
      model: User,
      attributes: ["username", "id", "slug"],
    },
  });

  console.log(pages);

  return res.send({
    success: true,
    pages,
  }) as any;
};

export const create = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user) {
      const { id } = req.user;
      const { title, isPrivate } = req.body as any;

      console.log(req.body);

      if (!title || typeof isPrivate !== "boolean") {
        throw new ServerError("Please provide title and private type", 400);
      }

      const page = await Page.create({
        title,
        private: isPrivate,
        UserId: `${id}`,
        slug: await generatePageSlug(),
      });

      return res.send({
        success: true,
        page: page,
      });
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
    const { slug } = req.params;

    if (!slug) {
      throw new ServerError("Provide id for page to be deleted", 400);
    }

    await Page.update({ deleted: true }, { where: { slug } });

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

    const page = await Page.findOne({
      where: { slug },
      include: {
        model: User,
        attributes: ["username", "id", "slug"],
      },
    });

    if (!page) {
      throw new ServerError("Page not found", 404);
    }
    return res.status(200).send({ success: true, page });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
