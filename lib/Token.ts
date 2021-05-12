import crypto from "crypto";

export default class Token {
  static tokenLength: number = 24;

  static generate(): string {
    return crypto.randomBytes(this.tokenLength).toString("hex");
  }
}
