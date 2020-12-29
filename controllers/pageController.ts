import { Response, NextFunction, Request } from "express";
import ServerError from "../helpers/errorHandler";
import { UserRequest } from "../interfaces/expressInterface";
import { generatePageSlug } from "../helpers/generateSlug";
import { Page } from "../database/entity/Page";
import { User } from "../database/entity/User";

export const getAll = async (req: UserRequest, res: Response) => {
  const { id } = req.user;

  if (!id) {
    throw new ServerError();
  }

  const pages = await Page.createQueryBuilder("page")
    .where(`page.ownerId = :id`, {
      id,
    })
    .getMany();

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

      if (!title || typeof isPrivate !== "boolean") {
        throw new ServerError("Please provide title and private type", 400);
      }

      const user = await User.findOne({ id });

      if (!user) {
        throw new ServerError();
      }

      const page = Page.create({
        title,
        private: isPrivate,
        owner: user,
        slug: await generatePageSlug(),
      });

      await page.save();

      return res.status(201).send({
        success: true,
        page,
      });
    } else {
      throw new ServerError();
    }
  } catch (err) {
    next(err);
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

    await Page.delete({ slug });

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

    const page = await Page.findOne(
      { slug },
      { relations: ["members", "owner"] }
    );

    if (!page) {
      throw new ServerError("Page not found", 404);
    }
    return res.status(200).send({ success: true, page });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { data } = req.body;

    if (!data) {
      throw new ServerError("Provide data to store", 400);
    }

    await Page.update({ slug }, { content: data });

    res.send({ success: true, lastUpdateTime: new Date() });
  } catch (err) {
    next(err);
  }
};
