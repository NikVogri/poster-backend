import { Response, NextFunction } from "express";
import { User } from "../database/entity/User";
import { MAX_IMAGE_SIZE, __test__ } from "../config/environment";
import { UserRequest } from "../interfaces/express";

import ServerError from "../errors/ServerError";
import BadRequestError from "../errors/BadRequestError";

import Image from "../lib/Image";

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
