import { NextFunction, Request, Response } from "express";
import ServerError from "../helpers/errorHandler";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateUsernameSlug } from "../helpers/generateSlug";
import passwordValidator from "../helpers/passwordValidator";
import { User as UserInterface } from "../interfaces/userInterface";

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
