import { NextFunction, Response, Request } from "express";
// import { UserRequest } from "../interfaces/expressInterface";
import { Post as PostInterface } from "../interfaces/postInterface";
import { User } from "../interfaces/userInterface";
import Post from "../models/Post";

interface UserRequest extends Request {
  user: User;
}

const isOwner = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const post: PostInterface | null = await Post.findOne({
      where: { id: postId },
    });
    const { id: userId } = req.user;

    if (!post) {
      return res
        .status(400)
        .send({ success: false, error: "Post with that id was not found" });
    }

    if (userId !== post.UserId) {
      return res.status(403).send({ success: false, msg: "Not Allowed" });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .send({ success: false, msg: "Something went wrong" });
  }
};

export default isOwner;
