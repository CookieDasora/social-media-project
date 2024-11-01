import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export const UserSchema = z
	.object({
		id: z.string().uuid(),
		displayName: z.string().optional(),
		username: z.string(),
		email: z.string().email(),
		password: z.password(),
		kweeks: z.array(z.object({})).optional(),
		profileImage: z.string().url().optional(),
		followers: z.number(),
		following: z.number(),
		comments: z.array(z.object({})).optional(),
		createdAt: z.date(),
	})
	.required();

export class UserModel extends createZodDto(UserSchema) {}
