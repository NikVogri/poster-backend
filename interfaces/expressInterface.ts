import { Page } from "../database/entity/Page";
import { User } from "./userInterface";

export interface UserRequest extends Request {
	user: User;
	params: any;
	body: any;
	session: any;
}
export interface UserPageRequest extends Request {
	user: User;
	page: Page;
	params: any;
	body: any;
	session: any;
}
