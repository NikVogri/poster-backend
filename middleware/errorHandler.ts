import { Request, Response } from "express-serve-static-core";
import BaseError from "../errors/BaseError";

const errorHandler = (
  err: { errors?: any[]; message?: string; statusCode?: number },
  _: Request,
  res: Response,
  _2: any
) => {
  let error = {
    code: 500,
    errorMessage: "Something went wrong",
  };

  if (err instanceof Error) {
    error.code = err.statusCode!;
    error.errorMessage = err.message;
  }

  return res
    .status(error.code)
    .send({ success: false, error: error.errorMessage });
};

export default errorHandler;
