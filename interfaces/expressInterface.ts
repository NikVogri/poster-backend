import { User } from "./userInterface";

export interface UserRequest extends Request {
	user: User;
	params: any;
	body: any;
	session: any;
}
