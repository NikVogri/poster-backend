import slugify from "slugify";

import { User } from "../database/entity/User";
import { Like } from "typeorm";

/**
 * @description generate unique username slug
 * @param username
 * @returns usernameSlug
 */

export const generateUsernameSlug = async (
	username: string
): Promise<string> => {
	let usernameSlug = slugify(username, { lower: true, strict: true });

	const slugStackCount = await User.count({ slug: Like(`${usernameSlug}%`) });

	if (slugStackCount > 0) {
		usernameSlug += `-${slugStackCount}`;
	}

	return usernameSlug;
};
