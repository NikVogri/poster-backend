import { Op } from "sequelize";
import slugify from "slugify";
import { User as UserInterface } from "../interfaces/userInterface";
import { Page as PageInterface } from "../interfaces/pageInterface";
import User from "../models/User";
import Page from "../models/Page";
import crypto from "crypto";

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

export const generatePageSlug = async (): Promise<string> => {
  let isNotUnique = true;
  let pageSlug = "";

  while (isNotUnique) {
    pageSlug = crypto.randomBytes(12).toString("hex");

    const pages: PageInterface[] | [] = await Page.findAll({
      where: { slug: { [Op.like]: `%${pageSlug}%` } },
    });

    if (!pages.length) {
      isNotUnique = false;
    }
  }

  return pageSlug;
};
