import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const SignInUserSchema = z
	.object({
		username: z
			.string({
				required_error: "Username is required",
			})
			.regex(
				/^[a-zA-Z0-9_.]{5,15}$/,
				"The username must have alphanumerics characters, underscore, dots and it must be between 5 and 15 characters",
			)
			.toLowerCase(),
		password: z
			.password({
				required_error: "Password is required",
			})
			.min(8)
			.max(32)
			.atLeastOne("digit")
			.atLeastOne("uppercase")
			.atLeastOne("lowercase")
			.atLeastOne("special")
			.transform((value) => value.replace(/\s+/g, "")), // Removes every whitespace
	})
	.required();

export class SignInUserDTO extends createZodDto(SignInUserSchema) {}
