import BaseError from "./BaseError";

export default class ServerError extends BaseError {
  public statusCode: number;
  public errorMessage: string;

  constructor(message?: string, statusCode?: number) {
    const errorMessage = message || "Something went wrong on our side!";

    super(errorMessage);
    this.errorMessage = errorMessage;
    this.statusCode = statusCode || 500;

    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
