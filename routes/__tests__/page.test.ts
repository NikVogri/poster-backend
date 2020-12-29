import supertest from "supertest";
import app from "../../app";
import { Page } from "../../database/entity/Page";
import { loginUser, createPage } from "../../tests/setup";

const request = supertest(app);

it("/ -> can't create a page without being logged in", async () => {
  await request
    .post("/api/v1/pages")
    .send({ title: "my new page", isPrivate: false })
    .expect(403);
});

// it("/ -> can create a page when logged in", async () => {
//   const pageTitle = "my new page";
//   await request
//     .post("/api/v1/pages")
//     .set("Cookie", await loginUser())
//     .send({ title: pageTitle, isPrivate: false })
//     .expect(201);

//   const page = await Page.findOne();

//   expect(page!.title).toEqual(pageTitle);
// });

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

it("/all/:slug -> can get all pages for only a specific user", async () => {
  const nicksCookie = await loginUser("nick", "nick@nick.com");
  const otherCookie = await loginUser("bob", "bob@bob.com");

  await createPage("my first page", nicksCookie); //  Nicks page
  await createPage("my second page", nicksCookie); //  Nicks page
  await createPage("my third page", otherCookie); // Other use page -> should not get returned

  const res = await request
    .get(`/api/v1/pages/all`)
    .set("Cookie", nicksCookie)
    .send()
    .expect(200);

  expect(res.body.pages.length).toEqual(2);
});

// it("/:slug -> returns 403 if the user is not the owner of the page", async () => {
//   const cookie = await loginUser();
//   const page = await createPage("my page", cookie);

//   await request
//     .delete(`/api/v1/pages/${page.body.page.slug}`)
//     .send()
//     .expect(403);
// });

it("/:slug -> returns 403 if the user is not the owner of the page", async () => {
  const pageCreatorCookie = await loginUser();
  const otherUserCookie = await loginUser("bob", "bob@gmail.com");
  const page = await createPage("my page", pageCreatorCookie);

  await request
    .delete(`/api/v1/pages/${page.body.page.slug}`)
    .set("Cookie", otherUserCookie)
    .send()
    .expect(403);
});

// it("/:slug -> returns 403 if the user is not authenticated", async () => {
//   const page = await createPage("my page ");

//   await request
//     .delete(`/api/v1/pages/${page.body.page.slug}`)
//     .send()
//     .expect(403);
// });

it("/:slug -> deletes a page if the user is owner of that page", async () => {
  const pageCreatorCookie = await loginUser("bob");
  const page = await createPage("my page", pageCreatorCookie);

  await request
    .delete(`/api/v1/pages/${page.body.page.slug}`)
    .set("Cookie", pageCreatorCookie)
    .send()
    .expect(200);

  const pages = await Page.find();

  expect(pages.length).toEqual(0);
});

it("/:slug -> returns a single page with owner", async () => {
  const pageTitle = "my page title";
  const username = "nickolas";
  const cookie = await loginUser(username);

  const page = await createPage(pageTitle, cookie);

  const res = await request
    .get(`/api/v1/pages/${page.body.page.slug}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(res.body.page.title).toEqual(pageTitle);
  expect(res.body.page.owner.username).toEqual(username);
});
