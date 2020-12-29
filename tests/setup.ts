import request from "supertest";
import app from "../app";

import { ForgotPasswordToken } from "../database/entity/ForgotPasswordToken";
import { User } from "../database/entity/User";
import { Page } from "../database/entity/Page";
import { createConnection, getConnection } from "typeorm";

beforeEach(() => {
  return createConnection({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [User, Page],
    synchronize: true,
    logging: false,
  });
});

afterEach(() => {
  let conn = getConnection();
  return conn.close();
});

export const loginUser = async (
  username: string = "tester",
  email: string = "test@test.com",
  password: string = "password"
): Promise<string> => {
  // create new user
  await request(app)
    .post("/api/v1/auth/register")
    .send({ username, email, password });

  // get cookie from response
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  return res.headers["set-cookie"][0].split(";")[0];
};

export const createPage = async (
  title: string,
  cookie?: string,
  isPrivate: boolean = false
): Promise<any> => {
  return await request(app)
    .post("/api/v1/pages")
    .set("Cookie", cookie || (await loginUser()))
    .send({ title, isPrivate });
};
