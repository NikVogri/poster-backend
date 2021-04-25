import supertest from "supertest";
import app from "../../app";
import { Page, PageType } from "../../database/entity/Page";
import { loginUser, createPage, createUser } from "../../tests/setup";

const request = supertest(app);

it("/ -> can't create a page without being logged in", async () => {
	await request
		.post("/api/v1/pages")
		.send({ title: "my new page", isPrivate: false })
		.expect(403);
});

it("/ -> can create todo page when logged in", async () => {
	const pageTitle = "my new page";
	await request
		.post("/api/v1/pages")
		.set("Cookie", await loginUser())
		.send({ title: pageTitle, isPrivate: false, type: PageType.todo })
		.expect(201);

	const page = await Page.findOne();

	expect(page!.title).toEqual(pageTitle);
});
it("/ -> can create notebook page when logged in", async () => {
	const pageTitle = "my new page";
	await request
		.post("/api/v1/pages")
		.set("Cookie", await loginUser())
		.send({ title: pageTitle, isPrivate: false, type: PageType.notebook })
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

it("/all/:slug -> should get pages that the user is owner and member of", async () => {
	const nicksCookie = await loginUser("nick", "nick@nick.com");
	const janesCookie = await loginUser("jane", "jane@jane.com");
	const otherCookie = await loginUser("bob", "bob@bob.com");

	await createPage("nicks page", nicksCookie); //  Nicks page
	const janePage = await createPage("janes page", janesCookie); //  Janes page
	await createPage("bobs page", otherCookie); // Other use page -> should not get returned

	await request
		.post(`/api/v1/pages/${janePage.id}/members/add`)
		.set("Cookie", janesCookie)
		.send({ email: "nick@nick.com" })
		.expect(200);

	const res = await request
		.get(`/api/v1/pages/all`)
		.set("Cookie", nicksCookie)
		.send()
		.expect(200);

	expect(res.body.pages[0].title).toEqual("nicks page");
	expect(res.body.pages[1].title).toEqual("janes page");
});

it("/:slug -> returns 403 if the user is not the owner of the page", async () => {
	const cookie = await loginUser();
	const page = await createPage("my page", cookie);

	await request.delete(`/api/v1/pages/${page.id}`).send().expect(403);
});

it("/:slug -> returns 403 if the user is not the owner of the page", async () => {
	const pageCreatorCookie = await loginUser();
	const otherUserCookie = await loginUser("bob", "bob@gmail.com");
	const page = await createPage("my page", pageCreatorCookie);

	await request
		.delete(`/api/v1/pages/${page.id}`)
		.set("Cookie", otherUserCookie)
		.send()
		.expect(403);
});

it("/:slug -> returns 403 if the user is not authenticated", async () => {
	const page = await createPage("my page ");

	await request.delete(`/api/v1/pages/${page.id}`).send().expect(403);
});

it("/:slug -> deletes a page if the user is owner of that page", async () => {
	const pageCreatorCookie = await loginUser("bob");
	const page = await createPage("my page", pageCreatorCookie);

	await request
		.delete(`/api/v1/pages/${page.id}`)
		.set("Cookie", pageCreatorCookie)
		.send()
		.expect(200);

	const pages = await Page.find();

	expect(pages.length).toEqual(0);
});

it("/:slug -> returns a single page to any member", async () => {
	const memberEmail = "jane@jane.com";
	await createUser("jane", memberEmail);

	const pageTitle = "my page title";

	const username = "nickolas";
	const ownerCookie = await loginUser(username);

	const page = await createPage(pageTitle, ownerCookie);

	const janesToken = await loginUser("jane", memberEmail);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: memberEmail })
		.expect(200);

	const res = await request
		.get(`/api/v1/pages/${page.id}`)
		.set("Cookie", janesToken)
		.send()
		.expect(200);

	expect(res.body.page.title).toEqual(pageTitle);
	expect(res.body.page.owner.username).toEqual(username);
	expect(
		res.body.page.members.some((member) => member.email == memberEmail)
	).toBeTruthy();
});

it("/:slug returns single page to owner", async () => {
	const ownerEmail = "jane@jane.com";
	const pageTitle = "my new page";

	const ownerCookie = await loginUser("jane", ownerEmail);
	const res = await request
		.post(`/api/v1/pages`)
		.set("Cookie", ownerCookie)
		.send({ title: pageTitle, isPrivate: true, type: PageType.todo })
		.expect(201);

	await request
		.get(`/api/v1/pages/${res.body.page.id}`)
		.set("Cookie", ownerCookie)
		.send()
		.expect(200);

	const freshPage = await Page.findOne(
		{ id: res.body.page.id },
		{ relations: ["owner"] }
	);

	console.log(res.body.page);
	expect(freshPage!.title).toEqual(pageTitle);
	expect(freshPage!.owner.email).toEqual(ownerEmail);
});

it("/:slug returns a 403 if the user is not a member or owner and the page is private", async () => {
	const ownerCookie = await loginUser("jane", "jane@jane.com");

	const res = await request
		.post(`/api/v1/pages`)
		.set("Cookie", ownerCookie)
		.send({
			title: "my new page",
			isPrivate: true,
			type: PageType.notebook,
		})
		.expect(201);

	const randomCookie = await loginUser("bob", "bob@bob.com");

	await request
		.get(`/api/v1/pages/${res.body.page.id}`)
		.set("Cookie", randomCookie)
		.send()
		.expect(403);
});
