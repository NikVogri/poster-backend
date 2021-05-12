import { Response, NextFunction, Request } from "express";
import ServerError from "../errors/ServerError";
import BadRequestError from "../errors/BadRequestError";
import { User } from "../database/entity/User";
import { __test__ } from "../config/environment";
import Image from "../lib/Image";
import { UserRequest } from "../interfaces/express";

const MAX_IMAGE_SIZE = 1048576; // 1MB;

interface FileUserRequest extends UserRequest {
  file: { mimetype: string; size: number; buffer: Buffer };
}

export const setAvatar = async (
  req: FileUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user;

    if (!req.file.mimetype.includes("image/")) {
      throw new BadRequestError("Uploaded file is not an image");
    }

    if (req.file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestError(
        `Image size can't exceed ${MAX_IMAGE_SIZE / 1048576}mb`
      );
    }

    const uploadRes = await Image.uploadStream(req.file.buffer, "pager");

    if (!uploadRes.url) {
      throw new ServerError();
    }

    const user = await User.update({ email }, { avatar: uploadRes.url });

    if (!user) {
      throw new ServerError();
    }

    res.send({ success: true, msg: "Avatar changed" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
