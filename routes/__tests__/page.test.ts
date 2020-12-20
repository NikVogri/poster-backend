import { userInfo } from "os";
import supertest from "supertest";
import app from "../../app";
import Page from "../../models/Page";
import User from "../../models/User";
import { loginUser } from "../../tests/setup";

const request = supertest(app);

const createPage = async (
  cookie: string,
  title: string,
  isPrivate: boolean = false
) => {
  return await request
    .post("/api/v1/pages")
    .set("Cookie", cookie)
    .send({ title, isPrivate });
};

it("/ -> can't create a page without being logged in", async () => {
  await request
    .post("/api/v1/pages")
    .send({ title: "my new page", isPrivate: false })
    .expect(403);
});

it("/ -> can create a page when logged in", async () => {
  const pageTitle = "my new page";
  await request
    .post("/api/v1/pages")
    .set("Cookie", await loginUser())
    .send({ title: pageTitle, isPrivate: false })
    .expect(201);

  const page = await Page.findOne();

  expect(page!.title).toEqual(pageTitle);
});

it("/ -> can't create a page when title is not sent", async () => {
  await request
    .post("/api/v1/pages")
    .set("Cookie", await loginUser())
    .send({ title: "", isPrivate: false })
    .expect(400);
});

it("/ -> can't create a page when isPrivate is not sent", async () => {
  await request
    .post("/api/v1/pages")
    .set("Cookie", await loginUser())
    .send({ title: "", isPrivate: null })
    .expect(400);
});

it("/all/:UserId -> can get all pages for only a specific user", async () => {
  const nicksCookie = await loginUser("nick", "nick@nick.com");
  const otherCookie = await loginUser("bob", "bob@bob.com");

  await createPage(nicksCookie, "my first page"); //  Nicks page
  await createPage(nicksCookie, "my second page"); //  Nicks page
  await createPage(otherCookie, "my third page"); // Other use page -> should not get returned

  const nick = await User.findOne({ where: { email: "nick@nick.com" } });

  const res = await request
    .get(`/api/v1/pages/all/${nick!.id}`)
    .send()
    .expect(200);

  expect(res.body.pages.length).toEqual(2);
});

it("/:slug -> returns 400 if the user is not the owner of the page", async () => {
  const cookie = await loginUser();
  const page = await createPage(cookie, "my page");

  await request
    .delete(`/api/v1/pages/${page.body.page.slug}`)
    .send()
    .expect(403);
});

it("/:slug -> returns 400 if the user is not the owner of the page", async () => {
  const pageCreatorCookie = await loginUser();
  const otherUserCookie = await loginUser("bob", "bob@gmail.com");
  const page = await createPage(pageCreatorCookie, "my page");

  await request
    .delete(`/api/v1/pages/${page.body.page.slug}`)
    .set("Cookie", otherUserCookie)
    .send()
    .expect(403);
});

it("/:slug -> returns 403 if the user is not authenticated", async () => {
  const pageCreatorCookie = await loginUser();
  const page = await createPage(pageCreatorCookie, "my page");

  await request
    .delete(`/api/v1/pages/${page.body.page.slug}`)
    .send()
    .expect(403);
});

it("/:slug -> deletes a page if the user is authenticated and owner", async () => {
  const pageCreatorCookie = await loginUser();
  const page = await createPage(pageCreatorCookie, "my page");

  let pages = await Page.findAll();

  expect(pages.length).toEqual(1);

  await request
    .delete(`/api/v1/pages/${page.body.page.slug}`)
    .set("Cookie", pageCreatorCookie)
    .send()
    .expect(200);

  pages = await Page.findAll();

  expect(pages.length).toEqual(0);
});

it("/:slug -> returns a single page with creator", async () => {
  const pageTitle = "my page title";
  const username = "nickolas";
  const cookie = await loginUser(username);
  const page = await createPage(cookie, pageTitle);

  const res = await request
    .get(`/api/v1/pages/${page.body.page.slug}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(res.body.page.title).toEqual(pageTitle);
  expect(res.body.page.User.username).toEqual(username);
});
