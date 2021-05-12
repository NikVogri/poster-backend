import { NextFunction, Request, Response } from "express-serve-static-core";
import { Page } from "../database/entity/Page";
import { User } from "../database/entity/User";
import { UserRequest } from "../interfaces/express";

import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";

export const inviteMember = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const { email: invitedEmail } = req.body;
	const { email: authUserEmail } = req.user!;
	const { id } = req.params;
	try {
		if (!invitedEmail) {
			throw new BadRequestError("No email provided");
		}

		if (authUserEmail === invitedEmail) {
			throw new BadRequestError("You can't invite yourself");
		}

		const user = await User.findOne({ email: invitedEmail });

		if (!user) {
			throw new BadRequestError("Invited user not found");
		}

		const page = await Page.findOne({ id }, { relations: ["members"] });

		if (!page) {
			throw new BadRequestError("Page not found");
		}

		page.members.push(user);
		await page.save();

		res.status(200).send({
			success: true,
			msg: "Member added to your page",
		});
	} catch (err) {
		next(err);
	}
};

export const getMembers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	try {
		if (!id) {
			throw new BadRequestError("No page id provided");
		}

		const page = await Page.findOne({ id }, { relations: ["members"] });

		if (!page) {
			throw new NotFoundError("Page not found");
		}

		res.send({ success: true, members: page.members });
	} catch (err) {
		next(err);
	}
};

export const removeMember = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	const { email: emailToRemove } = req.body;
	try {
		const page = await Page.findOne({ id }, { relations: ["members"] });

		if (!page) {
			throw new NotFoundError("Page not found");
		}

		if (!page.members.some((member) => member.email == emailToRemove)) {
			throw new BadRequestError("User is not a member of this page");
		}

		page.members = page.members.filter(
			(member) => member.email !== emailToRemove
		);
		await page.save();

		res.send({
			success: true,
			msg: `${emailToRemove} was removed from your page`,
		});
	} catch (err) {
		console.log(err);
		next(err);
	}
};

export const leave = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const { email } = req.user;
	const { id } = req.params;

	try {
		if (!id || typeof id !== "string") {
			throw new BadRequestError("Please provide page id");
		}

		const page = await Page.findOne({ id }, { relations: ["members"] });

		if (!page) {
			throw new NotFoundError("Page not found");
		}

		const isAMember = page.members.some((member) => member.email == email);

		if (!isAMember) {
			throw new BadRequestError("User is not a member of this page");
		}

		page.members = page.members.filter((member) => member.email !== email);
		await page.save();

		res.send(200).send({
			success: true,
			msg: "Successfully left the page",
		});
	} catch (err) {
		next(err);
	}
};
