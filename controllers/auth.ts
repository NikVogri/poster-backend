import { NextFunction, Request, Response } from "express";
import { generateUsernameSlug } from "../lib/generateUsernameSlug";
import { ForgotPasswordToken } from "../database/entity/ForgotPasswordToken";
import { User as UserInterface } from "../interfaces/user";
import { User } from "../database/entity/User";
import { sendEmail } from "../lib/sendEmail";

import BadRequestError from "../errors/BadRequestError";
import ServerError from "../errors/ServerError";
import UnauthorizedError from "../errors/UnauthorizedError";
import Password from "../lib/Password";
import Token from "../lib/Token";
import { UserRequest } from "../interfaces/express";
import { nextTick } from "process";

export const loginUser = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body;
		const user = await User.createQueryBuilder("user")
			.where({ email })
			.addSelect("user.password")
			.getOne();

		if (!user) {
			throw new UnauthorizedError(
				"Invalid email and password combination"
			);
		}

		if (!Password.validate(password, user.password)) {
			throw new BadRequestError("Invalid password");
		}

		req.session.email = user.email;

		res.send({
			success: true,
			user: {
				email: user.email,
				slug: user.slug,
				username: user.username,
				id: user.id,
			},
		});
	} catch (err) {
		next(err);
	}
};

export const registerUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { email, username, password } = req.body;
	const errors: string[] = [];
	try {
		if (!email || typeof email !== "string") {
			errors.push("Please provide a valid email address");
		}

		if (!username || typeof username !== "string") {
			errors.push("Please provide a valid username");
		}

		if (!password || typeof password !== "string") {
			errors.push("Please provide a valid password");
		}

		if (errors.length > 0) {
			return res.status(400).send({ success: false, error: errors });
		}

		// validate that user with that email does not yet exist
		const user = await User.findOne({ email });
		if (user) {
			throw new BadRequestError(
				"User with that email address already exists"
			);
		}

		const newUser = User.create({
			email,
			username,
			password: Password.hash(password),
			slug: await generateUsernameSlug(username),
		});

		await newUser.save();

		return res.status(201).send({ sucess: true });
	} catch (err) {
		return next(err);
	}
};

export const logoutUser = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		req.session.destroy((err: Error) => {
			if (err) {
				throw new ServerError();
			}
			res.status(200).send({ success: true });
		});
	} catch (err) {
		next(err);
	}
};

export const changePassword = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.user;
	const { newPassword } = req.body;
	try {
		if (!newPassword) {
			throw new BadRequestError("Provide new password");
		}

		const user = await User.findOne({ id });

		if (!user) {
			throw new ServerError();
		}

		user.password = Password.hash(newPassword);
		await user.save();

		res.status(200).send({
			success: true,
			msg: "Password changed successfully",
		});
	} catch (err) {
		return next(err);
	}
};

export const me = (req: UserRequest, res: Response) => {
	const user = req.user;

	res.status(200).send({
		success: true,
		user: {
			email: user.email,
			id: user.id,
			username: user.username,
		},
	});
};

export const forgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.body;

		if (!email) {
			throw new BadRequestError("Please provide an email address");
		}

		const user = await User.findOne({ email });

		if (!user) {
			throw new BadRequestError("No user found with that email address");
		}

		const olderToken = await ForgotPasswordToken.findOne({ user });

		if (olderToken) {
			await olderToken.remove();
		}

		const token = Token.generate();

		const forgotToken = ForgotPasswordToken.create({
			user,
			token,
		});

		await forgotToken.save();

		const message = `
    <h1>Your password reset</h1>
    <hr>
    <p>If you didn't request a password reset, please ignore this message. Otherwise click the link to reset your password.</p>
    <a style="margin-top: 30px;" href="${process.env.FRONTEND_URL}/reset-password/${token}">
      Reset your password
    </a>
    `;

		await sendEmail(user.email, "Password reset", message);

		res.send({ success: true, msg: "Email sent" });
	} catch (err) {
		next(err);
	}
};

export const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { password, token } = req.body;

		if (!password || !token) {
			throw new BadRequestError("Please provide password and token");
		}

		const userToken = await ForgotPasswordToken.findOne(
			{ token },
			{ relations: ["user"] }
		);

		if (!userToken) {
			throw new BadRequestError("Invalid token provided");
		}

		await User.update(
			{ id: userToken.user.id },
			{ password: Password.hash(password) }
		);
		await userToken.remove();

		res.send({ success: true, msg: "Password changed sucessfully" });
	} catch (err) {
		next(err);
	}
};
