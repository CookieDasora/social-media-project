import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const RefreshTokenSchema = z.object({
	refreshToken: z.string({
		required_error: "Refresh Token is required",
	}),
});

export class RefreshTokenDTO extends createZodDto(RefreshTokenSchema) {}
