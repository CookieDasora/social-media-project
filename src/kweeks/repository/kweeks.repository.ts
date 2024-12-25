import { Database } from "@/common/services/kysely/kysely.service";
import { Injectable } from "@nestjs/common";
import {
	jsonArrayFrom,
	jsonBuildObject,
	jsonObjectFrom,
} from "kysely/helpers/postgres";
import { v4 as uuid } from "uuid";

@Injectable()
export class KweeksRepository {
	constructor(private readonly database: Database) {}

	async create(content: string, authorId: string): Promise<{ id: string }> {
		const [kweek] = await this.database
			.insertInto("Kweek")
			.values({
				id: uuid(),
				content,
				authorId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning(["id"])
			.execute();

		return kweek;
	}

	async update(id: string, content: string) {
		return await this.database
			.updateTable("Kweek")
			.set({ content, updatedAt: new Date() })
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirst();
	}

	async findOne(id: string, withUserId: boolean) {
		return await this.database
			.selectFrom("Kweek")
			.select((eq) => [
				"id",
				"content",
				"attachments",
				"createdAt",
				"updatedAt",
				jsonBuildObject({
					likes: eq
						.selectFrom("KweekLike")
						.whereRef("kweekId", "=", "Kweek.id")
						.select(eq.fn.countAll<number>().as("likes")),
					comments: eq
						.selectFrom("Comments")
						.where("kweekId", "=", id)
						.select(eq.fn.countAll<number>().as("comments")),
				}).as("count"),
				jsonObjectFrom(
					eq
						.selectFrom("User")
						.select(["displayName", "username", "profileImage"])
						.whereRef("id", "=", "authorId"),
				).as("author"),
				jsonArrayFrom(
					eq
						.selectFrom("Comments")
						.select((qb) => [
							"id",
							"content",
							"attachments",
							"createdAt",
							"updatedAt",
							jsonBuildObject({
								likes: qb
									.selectFrom("CommentLike")
									.whereRef("commentId", "=", "Comments.id")
									.select(qb.fn.countAll<number>().as("likes")),
								replies: qb
									.selectFrom("Comments as Reply")
									.whereRef("Reply.parentId", "=", "Comments.id")
									.select(qb.fn.countAll<number>().as("replies")),
							}).as("count"),
							jsonObjectFrom(
								qb
									.selectFrom("User")
									.select(["displayName", "username", "profileImage"])
									.whereRef("id", "=", "Comments.userId"),
							).as("author"),
						])
						.whereRef("Comments.kweekId", "=", "Kweek.id"),
				).as("comments"),
			])
			.$if(withUserId, (qb) => qb.select("authorId"))
			.where("id", "=", id)
			.executeTakeFirst();
	}

	async delete(id: string) {
		return await this.database
			.deleteFrom("Kweek")
			.where("id", "=", id)
			.execute();
	}

	async like(userId: string, kweekId: string) {
		return await this.database
			.insertInto("KweekLike")
			.values({ userId, kweekId })
			.returningAll()
			.execute();
	}

	async dislike(kweekId: string, userId: string) {
		await this.database
			.deleteFrom("KweekLike")
			.where("kweekId", "=", kweekId)
			.where("userId", "=", userId)
			.execute();
	}

	async isAlreadyLiked(kweekId: string, userId: string) {
		return await this.database
			.selectFrom("KweekLike")
			.where("kweekId", "=", kweekId)
			.where("userId", "=", userId)
			.executeTakeFirst();
	}

	async addAttachments(kweekId: string, attachments: string[]) {
		return await this.database
			.updateTable("Kweek")
			.where("id", "=", kweekId)
			.set({ attachments })
			.returningAll()
			.executeTakeFirst();
	}
}
