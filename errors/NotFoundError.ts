import BaseError from "./BaseError";

export default class NotFoundError extends BaseError {
  public statusCode: number;
  public errorMessage: string;

  constructor(message?: string, statusCode?: number) {
    const errorMessage = message || "The searched entity could not be found";

    super(errorMessage);
    this.errorMessage = errorMessage;
    this.statusCode = statusCode || 404;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
