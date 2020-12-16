import { Op } from "sequelize";
import slugify from "slugify";
import { User as UserInterface } from "../interfaces/userInterface";
import { Post as PostInterface } from "../interfaces/postInterface";
import User from "../models/User";
import Post from "../models/Post";

export const generateUsernameSlug = async (
  username: string
): Promise<string> => {
  let usernameSlug = slugify(username, { lower: true, strict: true });

  const users: UserInterface[] | [] = await User.findAll({
    where: { slug: { [Op.like]: `${usernameSlug}%` } },
  });

  console.log("USERS", users);

  if (users.length > 0) {
    usernameSlug += `-${users.length}`;
  }

  return usernameSlug;
};

export const generatePostSlug = async (title: string): Promise<string> => {
  let postSlug = slugify(title, { lower: true, strict: true });

  const posts: PostInterface[] | [] = await Post.findAll({
    where: { slug: { [Op.like]: `${postSlug}%` } },
  });

  if (posts.length > 0) {
    postSlug += `-${posts.length}`;
  }

  return postSlug;
};
