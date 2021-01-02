import { NextFunction, Response } from "express";
import { Page } from "../database/entity/Page";
import NotFoundError from "../errors/NotFoundError";
import UnauthorizedError from "../errors/UnauthorizedError";
import { UserRequest } from "../interfaces/expressInterface";

interface PageRequest extends UserRequest {
  page: null | {};
}

const onlyOwnerOrMember = async (
  req: PageRequest,
  _: Response,
  next: NextFunction
) => {
  const { slug } = req.params;
  try {
    const page = await Page.findOne(
      { slug },
      { relations: ["members", "owner"] }
    );
    if (!page) {
      throw new NotFoundError("Page could not be found");
    }

    // check if page is not private -> can be accessed by anyone
    if (!page.private) {
      return next();
    }

    // checks if user is member or owner of the page
    if (
      !page.members.some((member: any) => (member.id = req.user.id)) &&
      page.owner.id !== req.user.id
    ) {
      throw new UnauthorizedError("You are not a member of this page", 403);
    }

    req.page = page;
    next();
  } catch (err) {
    next(err);
  }
};

export default onlyOwnerOrMember;
