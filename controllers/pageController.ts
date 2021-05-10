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
import { nextTick } from "process";
import { TodoItem } from "../database/entity/TodoItem";

export const getAll = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.user;

	try {
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
	} catch (err) {
		console.log(err);
		next(err);
	}
};

/**
 *
 * @description Get minimal information of other pages & subpages for sidebar component
 */
export const getOtherPages = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.user;
	try {
		const pages: Page[] = await Page.createQueryBuilder("page")
			.leftJoinAndSelect("page.members", "member")
			.leftJoinAndSelect("page.owner", "owner")
			.leftJoinAndSelect("page.todos", "todo")
			.leftJoinAndSelect("page.notebooks", "notebook")
			.where("member.id = :id", { id })
			.orWhere(`page.ownerId = :id`, {
				id,
			})
			.getMany();

		const culledPages = pages.map((page: Page) => {
			const item = {} as any;
			item["id"] = page.id;
			item["title"] = page.title;
			item["type"] = page.type;
			item["private"] = page.private;

			if (page.type === PageType.Notebook) {
				item["notebooks"] = page.notebooks.map(
					(notebook: Notebook) => ({
						id: notebook.id,
						title: notebook.title,
						updatedAt: notebook.updatedAt,
					})
				);
			}

			return item;
		});

		return res.status(200).send(culledPages);
	} catch (err) {
		console.log(err);
		next(err);
	}
};

/**
 *
 * @description Get page notebooks
 */
export const getPageNotebooks = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {};

/**
 *
 * @description Fetches todo blocks for a single page
 */
export const getPageTodos = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;

		const page = await Page.createQueryBuilder("page")
			.leftJoinAndSelect("page.todos", "todo")
			.orderBy("todo.createdAt", "DESC")
			.leftJoinAndSelect("todo.items", "items")
			.where({ id })
			.getOne();

		if (!page) {
			throw new BadRequestError("No page found with that id");
		}

		if (page.type !== PageType.Todo) {
			throw new BadRequestError("This page doesn't have todos");
		}

		// janky way of removing redundant data
		page.todos.forEach((todo: Todo) =>
			todo.items.forEach((item: any) => delete item.todoId)
		);

		res.send(page.todos);
	} catch (err) {
		console.log(err);
		next(err);
	}
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
			const notebook = await Notebook.create({ page }).save();
			page.notebooks = [];
			page.notebooks.push(notebook);
		} else if (type === PageType.Todo) {
			const todo = await Todo.create({ page }).save();
			page.todos = [];
			page.todos.push(todo);
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
		console.log(err);
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
			{ relations: ["owner", "members", "notebooks"] }
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

export const updateBanner = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { url, notebookId } = req.body;

		if (!url) {
			throw new BadRequestError("No banner url provided");
		}

		const page: Page = (req as any).page;
		console.log(page);

		if (page.type === PageType.Notebook) {
			if (!notebookId) {
				throw new BadRequestError("Please provide notebookId");
			}

			const notebook = await Notebook.findOne({ id: notebookId });

			if (!notebook) {
				throw new BadRequestError("No notebook found with that id");
			}

			notebook.banner.url = url;
			notebook.banner.active = true;

			notebook.save();
		} else if (page.type === PageType.Todo) {
			page.banner.active = true;
			page.banner.url = url;
			await page.save();
		}

		res.status(200).send({ success: true });
	} catch (err) {
		console.log(err);
		next(err);
	}
};

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
