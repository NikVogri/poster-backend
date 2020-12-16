import crypto from "crypto";

const TOKEN_LENGTH = 24;

export const generateUniqueToken = () =>
  crypto.randomBytes(TOKEN_LENGTH).toString("hex");
