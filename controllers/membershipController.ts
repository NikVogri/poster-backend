import { Request, Response } from "express-serve-static-core";
import ServerError from "../helpers/errorHandler";
import Page from "../models/Page";
import PageUser from "../models/PageUser";
import User from "../models/User";

export const invite = async (req: Request, res: Response) => {
  const { email } = req.body;
  const { slug } = req.params;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ServerError("User not found", 400);
    }

    const page = await Page.findOne({ where: { slug } });

    await PageUser.create({
      UserId: user.id,
      PageId: page!.id, // already validated that the page exists in isOwner middleware
    });

    res.status(200).send({ success: true });
  } catch (err) {
    throw new ServerError(err);
  }
};
