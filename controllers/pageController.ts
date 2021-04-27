import { Response, NextFunction, Request } from "express";
import { UserRequest } from "../interfaces/expressInterface";
import { Page } from "../database/entity/Page";
import { User } from "../database/entity/User";
import { PageType } from "../config/page";
import { Notebook } from "../database/entity/Notebook";
import { Todo } from "../database/entity/Todo";

import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";
import ServerError from "../errors/ServerError";

export const getAll = async (req: UserRequest, res: Response) => {
	const { id } = req.user;

	if (!id) {
		throw new ServerError();
	}

	const pages = await Page.createQueryBuilder("page")
		.leftJoinAndSelect("page.members", "member")
		.leftJoinAndSelect("page.owner", "owner")
		.where("member.id = :id", { id })
		.orWhere(`page.ownerId = :id`, {
			id,
		})
		.orderBy('"updatedAt"', "DESC")
		.getMany();

	return res.send({
		success: true,
		pages,
	}) as any;
};

export const create = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const errors: string[] = [];

		const { id } = req.user;
		let { title, isPrivate, type } = req.body as any;

		if (!title || typeof title !== "string") {
			errors.push("Please provide correct title");
		}

		if (typeof isPrivate !== "boolean") {
			errors.push("Please provide private status");
		}

		if (!type || !Object.values(PageType).includes(type)) {
			errors.push("Please provide a correct page type");
		}

		if (errors.length > 0) {
			return res.status(400).send({ success: false, error: errors });
		}

		const user = await User.findOne({ id });

		if (!user) {
			throw new BadRequestError("User not found");
		}

		const page = Page.create({
			type,
			title,
			owner: user,
			private: isPrivate,
		});

		if (type === PageType.Notebook) {
			page.notebook = await Notebook.create({ title }).save();
		} else if (type == PageType.Todo) {
			page.todo = await Todo.create({ title }).save();
		}

		await page.save();

		return res.status(201).send({
			success: true,
			page: {
				id: page.id,
				title: page.title,
				createdAt: page.createdAt,
			},
		});
	} catch (err) {
		next(err);
	}
};

export const remove = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;

		if (!id) {
			throw new BadRequestError("Provide id for page to be deleted");
		}

		const page = await Page.findOne({ id });

		if (!page) {
			throw new BadRequestError("Page not found");
		}

		await Page.delete({ id });

		res.send({ success: true });
	} catch (err) {
		return next(err);
	}
};

export const getSingle = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const page = await Page.findOne(
			{ id },
			{ relations: ["owner", "members"] }
		);

		if (!page) {
			throw new NotFoundError("Page not found");
		}

		return res.status(200).send({ success: true, page });
	} catch (err) {
		next(err);
	}
};

export const update = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {};

// export const update = async (
// 	req: Request,
// 	res: Response,
// 	next: NextFunction
// ) => {
// 	try {
// 		const { id } = req.params;
// 		const { data } = req.body;

// 		if (!data) {
// 			throw new BadRequestError("Provide data to store");
// 		}

// 		// await Page.update({ id });

// 		res.send({ success: true, lastUpdateTime: new Date() });
// 	} catch (err) {
// 		next(err);
// 	}
// };
