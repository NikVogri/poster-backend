import { NextFunction, Request, Response } from "express-serve-static-core";
import { Page } from "../database/entity/Page";
import { UserPageRequest } from "../interfaces/express";

import { Todo } from "../database/entity/Todo";
import { TodoItem } from "../database/entity/TodoItem";
import { TodoItemUpdate } from "../interfaces/todo";

import BadRequestError from "../errors/BadRequestError";
import ServerError from "../errors/ServerError";

export const addNewBlock = async (
	req: UserPageRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params;
		const { title, headerColor } = req.body;

		if (typeof title !== "string" || title.trim() === "") {
			throw new BadRequestError("Please provide a title");
		}

		if (typeof headerColor !== "string" || title.trim() === "") {
			throw new BadRequestError("Please provide header color");
		}

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
export const updateBlock = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { todoId } = req.params;
		const { title, headerColor } = req.body;

		if (typeof title !== "string" || title.trim() === "") {
			throw new BadRequestError("Please provide a title");
		}

		if (typeof headerColor !== "string" || headerColor.trim() === "") {
			throw new BadRequestError("Please provide header color");
		}

		const todoBlock = await Todo.findOne(
			{ id: todoId },
			{ relations: ["items"] }
		);

		if (!todoBlock) {
			throw new BadRequestError("Todo not found");
		}

		todoBlock.title = title;
		todoBlock.headerColor = headerColor;

		await todoBlock.save();

		res.status(200).send({ success: true, todoBlock });
	} catch (err) {
		console.log(err);
		next(err);
	}
};

export const addTask = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { todoId } = req.params;
		const { text } = req.body;

		if (typeof text !== "string" || text.trim() === "") {
			throw new BadRequestError("Please provide todo item text");
		}

		const todoBlock = await Todo.findOne(
			{ id: todoId },
			{ relations: ["items"] }
		);

		if (!todoBlock) {
			throw new BadRequestError("Todo block not found");
		}

		const todoItem = await TodoItem.create({ text }).save();

		todoBlock.items.push(todoItem);
		await todoBlock.save();

		res.status(200).send({ success: true, todoItem });
	} catch (err) {
		console.log(err);
		next(err);
	}
};

export const updateTask = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { updateType, taskId } = req.body;

		if (typeof taskId !== "string" || taskId.trim() === "") {
			throw new BadRequestError("Please provide taskId");
		}

		if (
			!updateType ||
			!Object.values(TodoItemUpdate).includes(updateType)
		) {
			throw new BadRequestError("Please provide correct updateType");
		}

		const task = await TodoItem.findOne({ id: taskId });

		if (!task) {
			throw new BadRequestError("Please provide correct taskId");
		}

		switch (updateType) {
			case TodoItemUpdate.COMPLETE:
				task.completed = true;
				await task.save();
				break;
			case TodoItemUpdate.UNCOMPLETE:
				task.completed = false;
				await task.save();
				break;
			case TodoItemUpdate.REMOVE:
				await task.remove();
				break;
		}

		res.status(200).send({
			success: true,
			todoItem: updateType === TodoItemUpdate.REMOVE ? null : task,
		});
	} catch (err) {
		console.log(err);
		next(err);
	}
};
