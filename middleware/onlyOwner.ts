import { NextFunction, Response, Request } from "express";
// import { UserRequest } from "../interfaces/expressInterface";
import { Page as PageInterface } from "../interfaces/page";
import { User } from "../interfaces/user";
import { Page } from "../database/entity/Page";
import UnauthorizedError from "../errors/UnauthorizedError";

interface UserRequest extends Request {
	user: User;
}

const onlyOwner = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const page = await Page.findOne({ id }, { relations: ["owner"] });
		const { id: userId } = req.user;

		if (!page) {
			return res
				.status(400)
				.send({
					success: false,
					error: "Page with that id was not found",
				});
		}

		if (userId !== page.owner.id) {
			throw new UnauthorizedError("", 403);
		}

		next();
	} catch (err) {
		next(err);
	}
};

export default onlyOwner;
