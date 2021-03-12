import request from "supertest";
import app from "../app";

import { User } from "../database/entity/User";
import { Page } from "../database/entity/Page";
import { createConnection, getConnection } from "typeorm";

import path from "path";
import { ForgotPasswordToken } from "../database/entity/ForgotPasswordToken";
import { PageType } from "../config/page";

beforeEach(async () => {
  return await createConnection({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [User, ForgotPasswordToken, Page],
    synchronize: true,
    logging: false,
  });
});

afterEach(async () => {
  await getConnection().close();
});

export const createUser = async (
  username: string = "tester",
  email: string = "test@test.com",
  password: string = "password"
): Promise<void> => {
  // create new user
  await request(app)
    .post("/api/v1/auth/register")
    .send({ username, email, password });
};

export const loginUser = async (
  username: string = "tester",
  email: string = "test@test.com",
  password: string = "password"
): Promise<string> => {
  await createUser(username, email, password);
  // get cookie from response
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  return res.headers["set-cookie"][0].split(";")[0];
};

export const createPage = async (
  title: string,
  cookie?: string,
  isPrivate: boolean = false,
  pageType: string = PageType.Notebook,
): Promise<any> => {
  const res = await request(app)
    .post("/api/v1/pages")
    .set("Cookie", cookie || (await loginUser()))
    .send({ title, isPrivate, pageType });

  return res.body.page;
};

export const mockImage = (): any => {
  return path.join(__dirname, "/mock/images/image.png");
};
