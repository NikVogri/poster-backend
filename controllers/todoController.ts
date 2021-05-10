import { NextFunction, Request, Response } from "express-serve-static-core";
import { Page } from "../database/entity/Page";
import { User } from "../database/entity/User";
import { UserPageRequest, UserRequest } from "../interfaces/expressInterface";
import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";
import { Todo } from "../database/entity/Todo";
import ServerError from "../errors/ServerError";

export const addNewBlock = async (
	req: UserPageRequest,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	const { title, headerColor } = req.body;

	try {
		const page = await Page.findOne({ id }, { relations: ["todos"] });
		const todo = await Todo.create({ title, headerColor }).save();

		if (!page) {
			throw new ServerError();
		}

		page.todos.push(todo);
		await page.save();

		res.status(201).send({
			success: true,
			todo: {
				...todo,
				items: [],
			},
		});
	} catch (err) {
		console.log(err);
		next(err);
	}
};
export const updateBlock = (req: Request, res: Response) => {};

export const addTask = (req: Request, res: Response) => {};
export const toggleTask = (req: Request, res: Response) => {};
