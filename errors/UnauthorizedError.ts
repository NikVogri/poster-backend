import BaseError from "./BaseError";

export default class UnauthorizedError extends BaseError {
  public statusCode: number;
  public errorMessage: string;

  constructor(message?: string, statusCode?: number) {
    const errorMessage = message || "You are not allowed to do this action";

    super(errorMessage);
    this.message = errorMessage;
    this.statusCode = statusCode || 401;

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
