export const __prod__ = process.env.NODE_ENV === "production";
export const __dev__ = process.env.NODE_ENV === "development";
export const __test__ = process.env.NODE_ENV === "test";

export const MAX_IMAGE_SIZE = 1048576; // 1MB;

export const MIN_PASSWORD_CHAR = 6;
export const MIN_USERNAME_CHAR = 5;
export const MAX_USERNAME_CHAR = 50;
