import slugify from "slugify";
import { User } from "../database/entity/User";
import { Page } from "../database/entity/Page";
import crypto from "crypto";
import { Like } from "typeorm";

export const generateUsernameSlug = async (
  username: string
): Promise<string> => {
  let usernameSlug = slugify(username, { lower: true, strict: true });

  const slugStackCount = await User.count({ slug: Like(`${usernameSlug}%`) });

  console.log("SLUG COUNT", slugStackCount);

  if (slugStackCount > 0) {
    usernameSlug += `-${slugStackCount}`;
  }

  return usernameSlug;
};

export const generatePageSlug = async (): Promise<string> => {
  let pageSlug = "";

  pageSlug = crypto.randomBytes(12).toString("hex");

  const pagesWithSameSlugCount = await Page.count({
    slug: Like(`${pageSlug}%`),
  });

  if (pagesWithSameSlugCount > 0) {
    pageSlug = `${pageSlug}-${pagesWithSameSlugCount}`;
  }

  return pageSlug;
};
