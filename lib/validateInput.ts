import {
	MAX_USERNAME_CHAR,
	MIN_PASSWORD_CHAR,
	MIN_USERNAME_CHAR,
} from "../config/environment";

import BadRequestError from "../errors/BadRequestError";

type ValidType =
	| "string"
	| "number"
	| "object"
	| "array"
	| "email"
	| "username"
	| "password";

interface Config {
	[validate: string]: {
		required: boolean;
		type: ValidType;
		failMessage?: string;
	};
}

export const validateInput = (req: Request, config: Config) => {
	const { body } = req;

	if (!body) {
		throw new Error("No body provided");
	}

	for (const key of Object.keys(config)) {
		const filter = config[key];
		const value = body[key];
		const invalidMessage = filter.failMessage || `Please provide ${key}`;
		let isValid = true;

		if (!filter.required && !value) continue;
		if (filter.required && !value) isValid = false;
		if (!validateCorrectType(filter.type, value)) isValid = false;

		if (!isValid) {
			throw new BadRequestError(invalidMessage);
		}
	}
};

const validateCorrectType = (type: ValidType, value: any): boolean => {
	switch (type) {
		case "string":
			return typeof value === "string" && value.trim() !== "";
		case "number":
			return !isNaN(value);
		case "object":
			return value === Object(value);
		case "array":
			return Array.isArray(value);
		case "password":
			return (
				typeof value === "string" &&
				value.trim() !== "" &&
				value.length >= MIN_PASSWORD_CHAR
			);
		case "username":
			return (
				isNaN(value) &&
				typeof value === "string" &&
				value.trim() !== "" &&
				value.length >= MIN_USERNAME_CHAR &&
				value.length <= MAX_USERNAME_CHAR
			);
		case "email":
			const emailRegEx =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return (
				typeof value === "string" &&
				value.trim() !== "" &&
				emailRegEx.test(value)
			);
	}
};
