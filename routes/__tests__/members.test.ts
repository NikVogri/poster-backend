import supertest from "supertest";
import app from "../../app";
import { Page } from "../../database/entity/Page";
import { createPage, createUser } from "../../tests/setup";
import { loginUser } from "../../tests/setup";

const request = supertest(app);

it("/add -> adds a user as a member if the user inviting is the owner of the page", async () => {
  const addToMembersEmail = "bob@bob.com";

  const ownerCookie = await loginUser();
  await loginUser("jane", addToMembersEmail);

  let page = await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie)
    .send({
      email: addToMembersEmail,
    })
    .expect(200);

  const res = await request
    .get(`/api/v1/pages/${page.slug}`)
    .set("Cookie", ownerCookie)
    .send()
    .expect(200);

  const freshPage = res.body.page;

  expect(freshPage.members.length).toBe(1);
  expect(
    freshPage.members.some(
      (a: { email: string }) => a.email == addToMembersEmail
    )
  ).toBeTruthy();
});

it("/add -> doesn't add a member if the inviting user is not the owner of the page", async () => {
  const addToMembersEmail = "bob@bob.com";

  const ownerCookie = await loginUser("jane", "jane@jane.com");
  const notAnOwnerCookie = await loginUser("john", "john@john.com");

  await loginUser("bob", addToMembersEmail);

  const page = await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", notAnOwnerCookie) // user that is not owner sends request
    .send({
      email: addToMembersEmail,
    })
    .expect(403);
});

it("/add -> doesn't add a user if the email is not registered", async () => {
  const unregisteredEmail = "bob@bob.com";

  const ownerCookie = await loginUser("jane", "jane@jane.com");
  const page = await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie)
    .send({
      email: unregisteredEmail,
    })
    .expect(400);
});

it("/add -> returns a 400 if the email for invited user is not provided", async () => {
  const ownerCookie = await loginUser("jane", "jane@jane.com");
  const page = await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie) // user that is not owner sends request
    .send({
      email: "",
    })
    .expect(400);
});

it("/add -> returns a 400 if the slug for the page is incorrect when adding member", async () => {
  const addToMembersEmail = "bob@bob.com";

  const ownerCookie = await loginUser("jane", "jane@jane.com");
  await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/incorrect-slug/members/add`)
    .set("Cookie", ownerCookie) // user that is not owner sends request
    .send({
      email: addToMembersEmail,
    })
    .expect(400);
});

it("/all -> returns a list of all members of the page", async () => {
  const addToMembersEmail1 = "bob@bob.com";
  const addToMembersEmail2 = "ziggy@ziggy.com";

  const ownerCookie = await loginUser("jane", "jane@jane.com");
  await createUser("bob", addToMembersEmail1);
  await createUser("ziggy", addToMembersEmail2);

  const page = await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie)
    .send({ email: addToMembersEmail1 })
    .expect(200);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie)
    .send({ email: addToMembersEmail2 })
    .expect(200);

  const res = await request
    .get(`/api/v1/pages/${page.slug}/members`)
    .set("Cookie", ownerCookie)
    .send();

  expect(res.body.members.length).toBe(2);
});

it("/remove -> can remove a user from the page", async () => {
  const addToMembersEmail1 = "bob@bob.com";
  const addToMembersEmail2 = "ziggy@ziggy.com";

  const ownerCookie = await loginUser("jane", "jane@jane.com");
  await createUser("bob", addToMembersEmail1);
  await createUser("ziggy", addToMembersEmail2);

  const page = await createPage("my own page", ownerCookie);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie)
    .send({ email: addToMembersEmail1 })
    .expect(200);

  await request
    .post(`/api/v1/pages/${page.slug}/members/add`)
    .set("Cookie", ownerCookie)
    .send({ email: addToMembersEmail2 })
    .expect(200);

  let res = await request
    .get(`/api/v1/pages/${page.slug}/members`)
    .set("Cookie", ownerCookie)
    .send();

  expect(res.body.members.length).toBe(2);

  await request
    .delete(`/api/v1/pages/${page.slug}/members/remove`)
    .set("Cookie", ownerCookie)
    .send({ email: addToMembersEmail1 }); // bob should be removed

  res = await request
    .get(`/api/v1/pages/${page.slug}/members`)
    .set("Cookie", ownerCookie)
    .send();

  expect(res.body.members.length).toBe(1);
});
