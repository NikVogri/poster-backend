import BaseError from "./BaseError";

export default class BadRequestError extends BaseError {
  public statusCode: number;
  public errorMessage: string;

  constructor(message?: string, statusCode?: number) {
    const errorMessage =
      message || "The request is invalid, please provide the correct data";
    super(errorMessage);
    this.message = errorMessage;
    this.statusCode = statusCode || 400;
  }
}
