import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

// TODO: see if it can be refactored

export const UpdatePasswordSchema = z
	.object({
		old_password: z
			.password({
				required_error: "Password is required",
			})
			.min(8)
			.max(32)
			.atLeastOne("digit")
			.atLeastOne("uppercase")
			.atLeastOne("lowercase")
			.atLeastOne("special")
			.transform((value) => value.replace(/\s+/g, "")),
		new_password: z
			.password({
				required_error: "Password is required",
			})
			.min(8)
			.max(32)
			.atLeastOne("digit")
			.atLeastOne("uppercase")
			.atLeastOne("lowercase")
			.atLeastOne("special")
			.transform((value) => value.replace(/\s+/g, "")),
	})
	.required();

export class UpdatePasswordDTO extends createZodDto(UpdatePasswordSchema) {}
