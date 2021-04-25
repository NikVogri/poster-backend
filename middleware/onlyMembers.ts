import { NextFunction, Response } from "express";
import { Page } from "../database/entity/Page";
import NotFoundError from "../errors/NotFoundError";
import UnauthorizedError from "../errors/UnauthorizedError";
import { UserRequest } from "../interfaces/expressInterface";

interface PageRequest extends UserRequest {
	page: null | {};
}

const isPrivate = async (req: PageRequest, _: Response, next: NextFunction) => {
	const { id } = req.params;
	try {
		const page = await Page.findOne({ id }, { relations: ["members"] });

		if (!page) {
			throw new NotFoundError("Page could not be found");
		}

		// check if page is not private -> can be accessed by anyone
		if (!page.private) {
			return next();
		}

		// checks if user is member of page
		if (!page.members.some((member: any) => (member.id = req.user.id))) {
			throw new UnauthorizedError("You are not a member of this page");
		}

		req.page = page;
		next();
	} catch (err) {
		next(err);
	}
};

export default isPrivate;
