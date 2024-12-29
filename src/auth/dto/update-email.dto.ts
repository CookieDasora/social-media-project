import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const UpdateEmailSchema = z
	.object({
		email: z
			.string({
				required_error: "Email is required",
			})
			.email("Invalid email"),
	})
	.required();

export class UpdateEmailDTO extends createZodDto(UpdateEmailSchema) {}
