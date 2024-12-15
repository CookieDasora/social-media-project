import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const UpdateNameSchema = z
	.object({
		username: z
			.string({ required_error: "Username is required" })
			.regex(
				/^[a-zA-Z0-9_.]{5,15}$/,
				"The username must have alphanumerics characters, underscore, dots and it must be between 5 and 15 characters",
			)
			.toLowerCase()
			.optional()
			.describe("Old / New Username")
			.or(z.literal("")),
		displayName: z.string().optional().or(z.literal("")),
	})
	.required();

export class UpdateNameDTO extends createZodDto(UpdateNameSchema) {}
