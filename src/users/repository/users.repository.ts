import { Injectable } from "@nestjs/common";
import { jsonArrayFrom, jsonBuildObject } from "kysely/helpers/postgres";
import { Database } from "src/services/kysely/kysely.service";
import { v4 as uuid } from "uuid";
import { UserModel } from "../models/user.model";
import { User } from "../types/user.type";

@Injectable()
export class UsersRepository {
	constructor(private readonly database: Database) {}

	async authSearch(identifier: string): Promise<UserModel | undefined> {
		const user = await this.database
			.selectFrom("User")
			.selectAll()
			.where((eb) =>
				eb.or([eb("username", "=", identifier), eb("id", "=", identifier)]),
			)
			.executeTakeFirst();

		return user ?? undefined;
	}

	async findById(id: string): Promise<UserModel | undefined> {
		const user = await this.database
			.selectFrom("User")
			.select(["id", "displayName", "username", "createdAt"])
			.where("id", "=", id)
			.executeTakeFirst();

		return user ?? undefined;
	}

	async findByUsername(username: string): Promise<UserModel | undefined> {
		const user = await this.database
			.selectFrom("User")
			.select((eq) => [
				"id",
				"displayName",
				"username",
				"createdAt",
				jsonBuildObject({
					followers: eq
						.selectFrom("Follows")
						.whereRef("followerId", "=", "User.id")
						.select(eq.fn.countAll<number>().as("followers")),
					following: eq
						.selectFrom("Follows")
						.whereRef("followingId", "=", "User.id")
						.select(eq.fn.countAll<number>().as("following")),
					kweeks: eq
						.selectFrom("Kweek")
						.whereRef("authorId", "=", "User.id")
						.select(eq.fn.countAll<number>().as("kweeks")),
				}).as("count"),
				jsonArrayFrom(
					eq
						.selectFrom("Kweek")
						.select((qb) => [
							"id",
							"content",
							"attachments",
							"createdAt",
							"updatedAt",
							jsonBuildObject({
								likes: qb
									.selectFrom("KweekLike")
									.whereRef("kweekId", "=", "Kweek.id")
									.select(eq.fn.countAll<number>().as("likes")),
								comments: qb
									.selectFrom("Comments")
									.whereRef("kweekId", "=", "Kweek.id")
									.select(eq.fn.countAll<number>().as("comments")),
							}).as("count"),
						])
						.whereRef("authorId", "=", "User.id"),
				).as("kweeks"),
			])
			.where("username", "=", username)
			.executeTakeFirst();

		return user ?? undefined;
	}

	async findByEmail(email: string): Promise<UserModel | undefined> {
		const user = await this.database
			.selectFrom("User")
			.select(["id", "displayName", "username", "createdAt"])
			.where("email", "=", email)
			.executeTakeFirst();
		return user ?? undefined;
	}

	async create(data: {
		username: string;
		email: string;
		password: string;
	}): Promise<Pick<UserModel, "displayName" | "username" | "createdAt">> {
		const user = this.database
			.insertInto("User")
			.values({
				id: uuid(),
				username: data.username,
				email: data.email,
				password: data.password,
				createdAt: new Date(),
			})
			.returning(["displayName", "username", "createdAt"])
			.executeTakeFirst();

		return user;
	}

	async countFollowers(id: string): Promise<number> {
		const count = await this.database
			.selectFrom("Follows")
			.where("followerId", "=", id)
			.select(this.database.fn.countAll<number>().as("count"))
			.executeTakeFirstOrThrow();

		return count.count ?? 0;
	}

	async countFollowing(id: string): Promise<number> {
		const count = await this.database
			.selectFrom("Follows")
			.where("followingId", "=", id)
			.select(this.database.fn.countAll<number>().as("count"))
			.executeTakeFirstOrThrow();

		return count.count ?? 0;
	}

	async getUserKweeks(id: string) {
		const kweeks = await this.database
			.selectFrom("Kweek")
			.where("authorId", "=", id)
			.select(["id", "content", "attachments", "createdAt", "updatedAt"])
			.execute();
		return kweeks;
	}
	async updateEmail(id: string, email: string): Promise<void> {
		await this.database
			.updateTable("User")
			.set({ email })
			.where("id", "=", id)
			.execute();
	}

	async updateUsername(
		id: string,
		username: string | undefined,
		displayName: string | undefined,
	): Promise<Pick<User, "username" | "displayName">> {
		const user = await this.database
			.updateTable("User")
			.set({ username, displayName })
			.where("id", "=", id)
			.returning(["username", "displayName"])
			.executeTakeFirst();
		return user;
	}

	async updatePassword(id: string, password: string): Promise<void> {
		await this.database
			.updateTable("User")
			.set({ password })
			.where("id", "=", id)
			.execute();
	}

	async updateProfileImage(
		id: string,
		url: string,
	): Promise<{ profileImage: string }> {
		return await this.database
			.updateTable("User")
			.set({ profileImage: url })
			.where("id", "=", id)
			.returning(["profileImage"])
			.executeTakeFirst();
	}

	async delete(id: string): Promise<void> {
		await this.database.deleteFrom("User").where("id", "=", id).execute();
	}

	async isFollowing(followerId: string, followingId: string): Promise<boolean> {
		const follows = await this.database
			.selectFrom("Follows")
			.where("followerId", "=", followerId)
			.where("followingId", "=", followingId)
			.executeTakeFirst();

		return follows !== undefined;
	}

	async follow(followerId: string, followingId: string) {
		return await this.database
			.insertInto("Follows")
			.values({ followerId, followingId })
			.returning(["followingId", "followerId"])
			.executeTakeFirst();
	}

	async unfollow(followerId: string, followingId) {
		return await this.database
			.deleteFrom("Follows")
			.where("followerId", "=", followerId)
			.where("followingId", "=", followingId)
			.execute();
	}
}
