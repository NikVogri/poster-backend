export default abstract class BaseError extends Error {
  abstract statusCode: number;
  abstract errorMessage: string;

  constructor(message?: string) {
    super(message);
  }
}
