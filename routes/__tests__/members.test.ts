import supertest from "supertest";
import app from "../../app";
import { Page } from "../../database/entity/Page";
import { loginUser, createUser, createPage } from "../../tests/setup";

const request = supertest(app);

it("/add -> adds a user as a member if the user inviting is the owner of the page", async () => {
	const toAddEmail = "bob@bob.com";

	const ownerCookie = await loginUser();
	await loginUser("jane", toAddEmail);

	let page = await createPage("my own page", ownerCookie);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({
			email: toAddEmail,
		})
		.expect(200);

	await request
		.get(`/api/v1/pages/${page.id}`)
		.set("Cookie", ownerCookie)
		.send()
		.expect(200);

	const freshPage = await Page.findOne(
		{ id: page.id },
		{ relations: ["members"] }
	);

	expect(freshPage!.members.length).toBe(1);
	expect(
		freshPage!.members.some((a: { email: string }) => a.email == toAddEmail)
	).toBeTruthy();
});

it("/add -> doesn't add a member if the inviting user is not the owner of the page", async () => {
	const addToMembersEmail = "bob@bob.com";

	const ownerCookie = await loginUser("jane", "jane@jane.com");
	const notAnOwnerCookie = await loginUser("john", "john@john.com");

	await loginUser("bob", addToMembersEmail);

	const page = await createPage("my own page", ownerCookie);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
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
		.post(`/api/v1/pages/${page.id}/members/add`)
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
		.post(`/api/v1/pages/${page.id}/members/add`)
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

it("/all -> returns a list of all members of the page to owner ", async () => {
	const addToMembersEmail1 = "bob@bob.com";
	const addToMembersEmail2 = "ziggy@ziggy.com";

	const ownerCookie = await loginUser("jane", "jane@jane.com");
	await createUser("bob", addToMembersEmail1);
	await createUser("ziggy", addToMembersEmail2);

	const page = await createPage("my own page", ownerCookie);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail1 })
		.expect(200);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail2 })
		.expect(200);

	const res = await request
		.get(`/api/v1/pages/${page.id}/members`)
		.set("Cookie", ownerCookie)
		.send();

	expect(res.body.members.length).toBe(2);
});

it("/all -> returns a 400 if the user is not an owner of the page", async () => {
	const addToMembersEmail = "bob@bob.com";
	const ownerCookie = await loginUser("jane", "jane@jane.com");
	const page = await createPage("my own page", ownerCookie);

	await createUser("bob", addToMembersEmail);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail })
		.expect(200);

	const randomUser = await loginUser("ziggy", "ziggy@ziggy.com");

	await request
		.get(`/api/v1/pages/${page.id}/members`)
		.set("Cookie", randomUser)
		.send()
		.expect(403);
});

it("/remove -> allows owner to remove a member from the page", async () => {
	const addToMembersEmail1 = "bob@bob.com";
	const addToMembersEmail2 = "ziggy@ziggy.com";

	const ownerCookie = await loginUser("jane", "jane@jane.com");
	await createUser("bob", addToMembersEmail1);
	await createUser("ziggy", addToMembersEmail2);

	const page = await createPage("my own page", ownerCookie);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail1 })
		.expect(200);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail2 })
		.expect(200);

	let res = await request
		.get(`/api/v1/pages/${page.id}/members`)
		.set("Cookie", ownerCookie)
		.send();

	expect(res.body.members.length).toBe(2);

	await request
		.put(`/api/v1/pages/${page.id}/members/remove`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail1 }); // bob should be removed

	res = await request
		.get(`/api/v1/pages/${page.id}/members`)
		.set("Cookie", ownerCookie)
		.send();

	expect(res.body.members.length).toBe(1);
});

it("/remove -> allows owner to remove a member from the page", async () => {
	const addToMembersEmail1 = "bob@bob.com";
	const addToMembersEmail2 = "ziggy@ziggy.com";

	const ownerCookie = await loginUser("jane", "jane@jane.com");
	await createUser("bob", addToMembersEmail1);
	await createUser("ziggy", addToMembersEmail2);

	const page = await createPage("my own page", ownerCookie);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail1 })
		.expect(200);

	await request
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: addToMembersEmail2 })
		.expect(200);

	let res = await request
		.get(`/api/v1/pages/${page.id}/members`)
		.set("Cookie", ownerCookie)
		.send();

	expect(res.body.members.length).toBe(2);

	const otherCookie = await loginUser("john", "john@john.com");

	await request
		.put(`/api/v1/pages/${page.id}/members/remove`)
		.set("Cookie", otherCookie)
		.send({ email: addToMembersEmail1 })
		.expect(403); // user is not an owner

	res = await request
		.get(`/api/v1/pages/${page.id}/members`)
		.set("Cookie", ownerCookie)
		.send();

	expect(res.body.members.length).toBe(2);
});

it("/leave -> allows a page member to leave page", async () => {
	const ownerCookie = await loginUser();
	await createUser("bob", "bob@gmail.com", "password");
	let page = await createPage("a page", ownerCookie);

	await request // owner adds a member to page
		.post(`/api/v1/pages/${page.id}/members/add`)
		.set("Cookie", ownerCookie)
		.send({ email: "bob@gmail.com" })
		.expect(200);

	// check that the user is actually added to members
	page = await Page.findOne({ id: page.id }, { relations: ["members"] });

	expect(
		page.members.some((a: { email: string }) => a.email == "bob@gmail.com")
	).toBeTruthy();

	const memberCookie = await loginUser("bob", "bob@gmail.com", "password");

	await request // member leaves page
		.post(`/api/v1/pages/${page.id}/members/leave`)
		.set("Cookie", memberCookie)
		.send()
		.expect(200);

	// check that the user is no longer a member
	page = await Page.findOne({ id: page.id }, { relations: ["members"] });

	expect(
		page.members.some((a: { email: string }) => a.email == "bob@gmail.com")
	).toBeFalsy();
});

it("/leave -> returns a 400 if the owner wants to leave the page", async () => {
	const ownerCookie = await loginUser();
	await createUser("bob", "bob@gmail.com", "password");
	let page = await createPage("a page", ownerCookie);

	await request // member leaves page
		.post(`/api/v1/pages/${page.id}/members/leave`)
		.set("Cookie", ownerCookie)
		.send()
		.expect(400);
});

it("/leave -> returns a 400 if the user that wants to leave is not a member of the page", async () => {
	const ownerCookie = await loginUser();
	await createUser("bob", "bob@gmail.com", "password");
	let page = await createPage("a page", ownerCookie);

	const memberCookie = await loginUser("bob", "bob@gmail.com", "password");

	await request // member leaves page
		.post(`/api/v1/pages/${page.id}/members/leave`)
		.set("Cookie", memberCookie)
		.send()
		.expect(400);
});
