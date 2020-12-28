import { NextFunction, Response, Request } from "express";
import ServerError from "../helpers/errorHandler";
// import { UserRequest } from "../interfaces/expressInterface";
import { Page as PageInterface } from "../interfaces/pageInterface";
import { User } from "../interfaces/userInterface";
import { Page } from "../database/entity/Page";

interface UserRequest extends Request {
  user: User;
}

const isOwner = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug }, { relations: ["owner"] });
    const { id: userId } = req.user;

    if (!page) {
      return res
        .status(400)
        .send({ success: false, error: "Page with that id was not found" });
    }

    if (userId !== page.owner.id) {
      return res.status(403).send({ success: false, msg: "Not Allowed" });
    }

    next();
  } catch (err) {
    throw new ServerError(err);
  }
};

export default isOwner;
