import request from "supertest";
import app from "../app";
import path from "path";

import User from "../models/User";
import Page from "../models/Page";
import ForgotPassword from "../models/ForgotPassword";
import { Sequelize } from "sequelize";

let db: Sequelize;

beforeAll(() => {
  db = new Sequelize("sqlite::memory");
});

beforeEach(async () => {
  await User.sync();
  await Page.sync();
  await ForgotPassword.sync();
});

afterEach(async () => {
  await User.destroy({ where: {}, force: true });
  await Page.destroy({ where: {}, force: true });
  await ForgotPassword.destroy({ where: {}, force: true });
});

afterAll(async () => {
  await db.close();
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
