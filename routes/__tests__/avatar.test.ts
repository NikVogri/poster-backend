import supertest from "supertest";
import app from "../../app";
import { loginUser, createUser, mockImage } from "../../tests/setup";
import { User } from "../../database/entity/User";

const request = supertest(app);

it("/ -> should add a default avatar on user creation", async () => {
  const email = "bob@bob.com";
  const username = "bob";
  await createUser(username, email);

  let user = await User.findOne({ email });

  expect(user!.avatar).toEqual(
    `https://ui-avatars.com/api/?name=${username}&color=7F9CF5&background=EBF4FF`
  );
});

it("/add -> should change avatar on image upload", async () => {
  const email = "bob@bob.com";
  const username = "bob";
  const userCookie = await loginUser(username, email);

  const image = mockImage();

  let user = await User.findOne({ email });

  expect(user!.avatar).toEqual(
    `https://ui-avatars.com/api/?name=${username}&color=7F9CF5&background=EBF4FF`
  );

  await request
    .post(`/api/v1/user/avatar/add`)
    .set("Cookie", userCookie)
    .attach("avatar", image)
    .expect(200);

  await user!.reload();

  expect(user!.avatar.includes(`https://res.cloudinary.com/`)).toBeTruthy();
});
