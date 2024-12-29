import { UserModel } from "@/users/models/user.model";
import { Database } from "@common/services/kysely/kysely.service";
import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";

@Injectable()
export class AuthRepository {
	constructor(private readonly database: Database) {}

	async createUser(data: {
		username: string;
		email: string;
		password: string;
	}): Promise<Pick<UserModel, "displayName" | "username" | "createdAt">> {
		return this.database
			.insertInto("User")
			.values({
				id: uuid(),
				username: data.username,
				password: data.password,
				createdAt: new Date(),
			})
			.returning(["displayName", "username", "createdAt"])
			.executeTakeFirst();
	}

	async findUser(identifier: string): Promise<UserModel | undefined> {
		const user = await this.database
			.selectFrom("User")
			.selectAll()
			.where((query) =>
				query.or([
					query("username", "=", identifier),
					query("id", "=", identifier),
				]),
			)
			.executeTakeFirst();

		return user ?? undefined;
	}

	async findUserByEmail(email: string): Promise<UserModel | undefined> {
		const user = await this.database
			.selectFrom("User")
			.where("email", "=", email)
			.executeTakeFirst();
		return user ?? undefined;
	}

	async findRefreshToken(refreshToken: string, userId: string) {
		const token = await this.database
			.selectFrom("RefreshToken")
			.selectAll()
			.where("token", "=", refreshToken)
			.where("userId", "=", userId)
			.executeTakeFirst();
		return token ?? undefined;
	}

	async storeRefreshToken(refreshToken: string, userId: string) {
		const expireAt = new Date();
		expireAt.setDate(expireAt.getDate() + 7); // Expires in 7d

		return await this.database
			.insertInto("RefreshToken")
			.values({
				id: uuid(),
				token: refreshToken,
				userId,
				expiryDate: expireAt,
			})
			.onConflict((oc) =>
				oc
					.column("userId")
					.doUpdateSet({ token: refreshToken, expiryDate: expireAt }),
			)
			.execute();
	}

	async updateUserEmail(id: string, email: string): Promise<void> {
		await this.database
			.updateTable("User")
			.set({ email })
			.where("id", "=", id)
			.execute();
	}

	async updateUserPassword(id: string, password: string): Promise<void> {
		await this.database
			.updateTable("User")
			.set({ password })
			.where("id", "=", id)
			.execute();
	}
}
