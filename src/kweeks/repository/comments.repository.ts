import { Database } from "@/common/services/kysely/kysely.service";
import { Injectable } from "@nestjs/common";
import {
	jsonArrayFrom,
	jsonBuildObject,
	jsonObjectFrom,
} from "kysely/helpers/postgres";
import { v4 as uuid } from "uuid";

@Injectable()
export class CommentsRepository {
	constructor(private readonly database: Database) {}

	async create(
		content: string,
		userId: string,
		kweekId: string | null,
		parentId: string | null,
	): Promise<{ id: string }> {
		const [comment] = await this.database
			.insertInto("Comments")
			.values({
				id: uuid(),
				content,
				userId,
				kweekId,
				parentId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning(["id"])
			.execute();

		return comment;
	}

	async update(id: string, content: string) {
		return await this.database
			.updateTable("Comments")
			.set({ content, updatedAt: new Date() })
			.where("id", "=", id)
			.returningAll()
			.executeTakeFirst();
	}

	async findOne(id: string, withUserId: boolean) {
		return await this.database
			.selectFrom("Comments")
			.select((eq) => [
				"id",
				"content",
				"attachments",
				"createdAt",
				"updatedAt",
				jsonObjectFrom(
					eq
						.selectFrom("User")
						.select(["displayName", "username", "profileImage"])
						.whereRef("id", "=", "Comments.userId"),
				).as("author"),
				jsonBuildObject({
					likes: eq
						.selectFrom("CommentLike")
						.whereRef("commentId", "=", "Comments.id")
						.select(eq.fn.countAll<number>().as("likes")),
					replies: eq
						.selectFrom("Comments")
						.where((qb) =>
							qb("Comments.kweekId", "=", id).or("parentId", "=", id),
						)
						.select(eq.fn.countAll<number>().as("replies")),
				}).as("count"),
				jsonArrayFrom(
					eq
						.selectFrom("Comments")
						.select((qb) => [
							"id",
							"content",
							"attachments",
							"createdAt",
							"updatedAt",
							jsonObjectFrom(
								qb
									.selectFrom("User")
									.select(["displayName", "username", "profileImage"])
									.whereRef("id", "=", "Comments.userId"),
							).as("author"),
							"kweekId",
							"parentId",
						])
						.where("Comments.parentId", "=", id),
				).as("replies"),
				"kweekId",
				"parentId",
			])
			.$if(withUserId, (qb) => qb.select("userId"))
			.where("id", "=", id)
			.executeTakeFirst();
	}

	async delete(id: string) {
		return await this.database
			.deleteFrom("Comments")
			.where("id", "=", id)
			.execute();
	}

	async like(userId: string, commentId: string) {
		return await this.database
			.insertInto("CommentLike")
			.values({ userId, commentId })
			.returningAll()
			.execute();
	}

	async dislike(commentId: string, userId: string) {
		await this.database
			.deleteFrom("CommentLike")
			.where("commentId", "=", commentId)
			.where("userId", "=", userId)
			.execute();
	}

	async isAlreadyLiked(commentId: string, userId: string) {
		return await this.database
			.selectFrom("CommentLike")
			.where("commentId", "=", commentId)
			.where("userId", "=", userId)
			.executeTakeFirst();
	}

	async addAttachments(commentId: string, attachments: string[]) {
		return await this.database
			.updateTable("Comments")
			.where("id", "=", commentId)
			.set({ attachments })
			.returningAll()
			.executeTakeFirst();
	}
}
