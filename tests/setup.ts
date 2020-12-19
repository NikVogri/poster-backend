import db from "../helpers/database";

beforeAll(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
});
