import { NextFunction, Request, Response } from "express";
import { User } from "../database/entity/User";
import { generateUsernameSlug } from "../helpers/generateSlug";
import { User as UserInterface } from "../interfaces/userInterface";
import { ForgotPasswordToken } from "../database/entity/ForgotPasswordToken";
import { sendEmail } from "../helpers/email";
import BadRequestError from "../errors/BadRequestError";
import ServerError from "../errors/ServerError";
import UnauthorizedError from "../errors/UnauthorizedError";
import Password from "../helpers/Password";
import Token from "../helpers/Token";

declare module "express-session" {
  interface Session {
    email: string;
  }
}

interface UserRequest extends Request {
  user: UserInterface;
}

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthorizedError("Invalid email and password combination");
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

  try {
    if (!email || !username || !password) {
      throw new BadRequestError(
        "Please enter all the required fields to create a new account"
      );
    }

    // validate that user with that email does not yet exist
    const user = await User.findOne({ email });
    if (user) {
      throw new BadRequestError("User with that email address already exists");
    }
    // store new user in database
    const slug = await generateUsernameSlug(username);
    const newUser = User.create({
      email,
      username,
      password: Password.hash(password),
      slug,
    });
    await newUser!.save();

    return res.status(201).send({ sucess: true });
  } catch (err) {
    return next(err);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  req.session.destroy((err) => {
    if (err) {
      throw new ServerError();
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
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({ id });

    if (!newPassword) {
      throw new BadRequestError("Provide new password");
    }

    if (!user) {
      throw new ServerError();
    }

    user.password = Password.hash(newPassword);
    await user.save();

    res
      .status(200)
      .send({ success: true, msg: "Password changed successfully" });
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

    console.log(userToken);
    const user = await User.findOne({ id: userToken.user.id });

    if (!user) {
      throw new ServerError();
    }

    user.password = Password.hash(password);
    await user.save();
    await userToken.remove();

    res.send({ success: true, msg: "Password changed" });
  } catch (err) {
    next(err);
  }
};
