import { NextFunction, Request, Response } from "express-serve-static-core";
import { Page } from "../database/entity/Page";
import { User } from "../database/entity/User";
import { UserRequest } from "../interfaces/expressInterface";
import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";

export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email: invitedEmail } = req.body;
  const { slug } = req.params;
  try {
    if (!invitedEmail) {
      throw new BadRequestError("No email provided");
    }

    const user = await User.findOne({ email: invitedEmail });

    if (!user) {
      throw new BadRequestError("Invited user not found");
    }

    const page = await Page.findOne({ slug }, { relations: ["members"] });

    if (!page) {
      throw new BadRequestError("Page not found");
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
      throw new BadRequestError("No page slug provided");
    }

    const page = await Page.findOne({ slug }, { relations: ["members"] });

    if (!page) {
      throw new NotFoundError("Page not found");
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
      throw new NotFoundError("Page not found");
    }

    if (!page.members.some((member) => member.email == emailToRemove)) {
      throw new BadRequestError("User is not a member of this page");
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
      throw new NotFoundError("Page not found");
    }

    const isAMember = page.members.some((member) => member.email == email);

    if (!isAMember) {
      throw new BadRequestError("User is not a member of this page");
    }

    page.members = page.members.filter((member) => member.email !== email);
    await page.save();

    res.send(200).send({ success: true, msg: "Successfully left the page" });
  } catch (err) {
    next(err);
  }
};
