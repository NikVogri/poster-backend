import request from "supertest";
import app from "../app";

import { ForgotPasswordToken } from "../database/entity/ForgotPasswordToken";
import { User } from "../database/entity/User";
import { Page } from "../database/entity/Page";
import { createConnection, getConnection } from "typeorm";

beforeEach(async () => {
  await createConnection({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [User, ForgotPasswordToken, Page],
    synchronize: true,
    logging: false,
  });
});

afterEach(() => {
  let connection = getConnection();
  return connection.close();
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

  console.log("COOKIE HERE", res.headers);

  return res.headers["set-cookie"][0].split(";")[0];
};

export const createPage = async (
  cookie: string,
  title: string,
  isPrivate: boolean = false
): Promise<any> => {
  await request(app)
    .post("/api/v1/pages")
    .set("Cookie", cookie)
    .send({ title, isPrivate });
};
