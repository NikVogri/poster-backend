import { NextFunction, Request, Response } from "express";
import ServerError from "../helpers/errorHandler";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateUsernameSlug } from "../helpers/generateSlug";
import passwordValidator from "../helpers/passwordValidator";
import { User as UserInterface } from "../interfaces/userInterface";
import ForgotPassword from "../models/ForgotPassword";
import { generateUniqueToken } from "../helpers/token";
import { sendEmail } from "../helpers/email";

declare module "express-session" {
  interface Session {
    email: string;
  }
}

interface UserRequest extends Request {
  user: UserInterface;
}

const SALT_ROUNDS = 10;

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ServerError("Invalid email and password combination", 401);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new ServerError("Invalid password", 400);
    }

    req.session.email = user.email;

    res.send({ success: true, user });
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

  try {
    if (!email || !username || !password) {
      throw new ServerError(
        "Please enter all the required fields to create a new account",
        400
      );
    }

    // validate that user with that email does not yet exist
    const users = await User.findAll({ where: { email } });
    if (users.length > 0) {
      throw new ServerError("User with that email address already exists", 400);
    }

    // create hashed password
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    // store new user in database
    const slug = await generateUsernameSlug(username);
    await User.create({ email, username, password: hashedPassword, slug });

    return res.status(201).send({ sucess: true });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      throw new ServerError("Something went wrong", 500);
    }
    res.status(200).send({ success: true });
  });
};

export const changePassword = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user;
  const { password, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { id } });

    if (!password || !newPassword) {
      throw new ServerError("Provide password and newPassword", 400);
    }

    if (!user) {
      throw new ServerError();
    }

    if (!passwordValidator(password, user.password)) {
      throw new ServerError("Old password is incorrect", 400);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
    await user.update({ password: hashedPassword });

    res
      .status(200)
      .send({ success: true, msg: "Password changed successfully" });
  } catch (err) {
    console.log(err);
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
      throw new ServerError("Please provide an email address", 400);
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ServerError("No user found with that email address", 400);
    }

    const olderToken = await ForgotPassword.findOne({
      where: { UserId: user.id },
    });

    if (olderToken) {
      await olderToken.destroy();
    }

    const token = await generateUniqueToken();

    await ForgotPassword.create({
      UserId: user.id,
      token,
    });

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
      throw new ServerError("Please provide password and token", 400);
    }

    const userToken = await ForgotPassword.findOne({
      where: { token },
    });

    if (!userToken) {
      throw new ServerError("Invalid token provided", 400);
    }

    const user = await User.findOne({ where: { id: userToken.UserId } });

    if (!user) {
      throw new ServerError();
    }

    const newHashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    user.update({ password: newHashedPassword });
    await user.save();
    await userToken.destroy();

    res.send({ success: true, msg: "Password changed" });
  } catch (err) {
    next(err);
  }
};
