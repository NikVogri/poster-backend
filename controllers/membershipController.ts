import { NextFunction, Request, Response } from "express-serve-static-core";
import ServerError from "../helpers/errorHandler";
import { Page } from "../database/entity/Page";
import { User } from "../database/entity/User";
import { UserRequest } from "../interfaces/expressInterface";

export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email: invitedEmail } = req.body;
  const { slug } = req.params;
  try {
    if (!invitedEmail) {
      throw new ServerError("No email provided", 400);
    }

    const user = await User.findOne({ email: invitedEmail });

    if (!user) {
      throw new ServerError("Invited user not found", 400);
    }

    const page = await Page.findOne({ slug }, { relations: ["members"] });

    if (!page) {
      throw new ServerError("Page not found", 400);
    }

    page.members.push(user);
    await page.save();

    res.status(200).send({ success: true, msg: "Member added to your page" });
  } catch (err) {
    next(err);
  }
};

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { slug } = req.params;
  try {
    if (!slug) {
      throw new ServerError("No page slug provided", 400);
    }

    const page = await Page.findOne({ slug }, { relations: ["members"] });

    if (!page) {
      throw new ServerError("Page not found", 404);
    }

    res.send({ success: true, members: page.members });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { slug } = req.params;
  const { email: emailToRemove } = req.body;
  try {
    const page = await Page.findOne({ slug }, { relations: ["members"] });

    if (!page) {
      throw new ServerError("Page not found", 404);
    }

    if (!page.members.some((member) => member.email == emailToRemove)) {
      throw new ServerError("User is not a member of this page", 400);
    }

    page.members = page.members.filter(
      (member) => member.email !== emailToRemove
    );
    await page.save();

    res.send({ success: true, msg: `${emailToRemove} removed from your page` });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const leave = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.user;
  const { slug } = req.params;

  try {
    const page = await Page.findOne({ slug }, { relations: ["members"] });

    if (!page) {
      throw new ServerError("Page not found", 404);
    }

    const isAMember = page.members.some((member) => member.email == email);

    if (!isAMember) {
      throw new ServerError("User is not a member of this page", 400);
    }

    page.members = page.members.filter((member) => member.email !== email);
    await page.save();

    res.send(200).send({ success: true, msg: "Successfully left the page" });
  } catch (err) {
    next(err);
  }
};
