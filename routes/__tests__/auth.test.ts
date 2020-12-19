import supertest from "supertest";
import app from "../../app";

const request = supertest(app);

it("doesnt return anything if the user is not logged in", async () => {
  const res = await request.get("/api/v1/auth/me").send().expect(403);
});
