import supertest from "supertest";
import app from "../../app";
import User from "../../models/User";
import { loginUser } from "../../tests/setup";

const request = supertest(app);

it("/register -> can create and store new user", async () => {
  const username = "nick";
  const email = "nick@somewhere.com";
  const password = "password";

  await request
    .post("/api/v1/auth/register")
    .send({ username, email, password })
    .expect(201);

  const user = await User.findOne();

  expect(user!.email).toEqual(email);
});

it("/login -> returns a cookie when user logs in with correct credentials", async () => {
  const username = "nick";
  const email = "nick@somewhere.com";
  const password = "password";

  // register
  await request
    .post("/api/v1/auth/register")
    .send({ username, email, password })
    .expect(201);

  const res = await request
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);

  expect(res.headers["set-cookie"]).not.toBeNull();
});

it("/login -> returns a 401 when user tries to login with incorrect credentials", async () => {
  const username = "nick";
  const email = "nick@somewhere.com";
  const password = "password";

  // register
  await request
    .post("/api/v1/auth/register")
    .send({ username, email, password })
    .expect(201);

  const res = await request
    .post("/api/v1/auth/login")
    .send({ email: "something@somewhere.com", password: "wrongpassword" })
    .expect(401);

  expect(res.headers["set-cookie"]).not.toBeNull();
});

it("/logout -> removes cookie from user to log them out", async () => {
  await request
    .post("/api/v1/auth/logout")
    .set("Cookie", await loginUser())
    .send()
    .expect(200);

  await request.get("/api/v1/auth/me").send().expect(403);
});

it("/me -> returns 403 when user is not authenticate", async () => {
  await request.get("/api/v1/auth/me").send().expect(403);
});

it("/me -> returns user signed in", async () => {
  const username = "nick";
  const email = "nick@somewhere.com";

  const res = await request
    .get("/api/v1/auth/me")
    .set("Cookie", await loginUser(username, email))
    .send()
    .expect(200);

  expect(res.body.user.username).toEqual(username);
  expect(res.body.user.email).toEqual(email);
});

it("/me -> returns user signed in", async () => {
  const username = "nick";
  const email = "nick@somewhere.com";

  const res = await request
    .get("/api/v1/auth/me")
    .set("Cookie", await loginUser(username, email))
    .send()
    .expect(200);

  expect(res.body.user.username).toEqual(username);
  expect(res.body.user.email).toEqual(email);
});

it("/change-password -> can't change password if the user is not authenticated", async () => {
  await request.post("/api/v1/auth/change-password").send().expect(403);
});

it("/change-password -> can change password if the user is authenticated", async () => {
  const oldPassword = "password";
  const newPassword = "mynewpassword";
  // changing password
  await request
    .post("/api/v1/auth/change-password")
    .set("Cookie", await loginUser("nick", "nick@somewhere.com", oldPassword))
    .send({ newPassword, password: oldPassword })
    .expect(200);

  // logging in with old password -> should not work
  await request
    .post("/api/v1/auth/login")
    .send({ email: "nick@somewhere.com", password: oldPassword })
    .expect(400);

  // logging in with new password -> should work

  await request
    .post("/api/v1/auth/login")
    .send({ email: "nick@somewhere.com", password: newPassword })
    .expect(200);
});
