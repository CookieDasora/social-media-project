import { S3Service } from "@common/modules/s3/s3.service";
import { File } from "@nest-lab/fastify-multer";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { CommentsRepository } from "./repository/comments.repository";
import { KweeksRepository } from "./repository/kweeks.repository";

@Injectable()
export class CommentsService {
	constructor(
		private readonly commentsRepository: CommentsRepository,
		private readonly kweeksRepository: KweeksRepository,
		private readonly s3: S3Service,
	) {}

	async create(
		kweek_id: string,
		content: string,
		user_id: string,
		files: Array<File>,
	) {
		if (content.length > 300) {
			throw new BadRequestException(
				"Content too big. Must have 300 characters or lower",
			);
		}

		// Verifies if the kweek_id is a kweek or a comment
		const parentComment = await this.commentsRepository.findOne(
			kweek_id,
			false,
		);

		let kweek = undefined;

		if (parentComment === undefined) {
			kweek = await this.kweeksRepository.findOne(kweek_id, false);

			if (kweek === undefined) {
				throw new NotFoundException("Kweek/Comment not found");
			}
		}

		const { id } = await this.commentsRepository.create(
			content,
			user_id,
			kweek ? kweek.id : null,
			parentComment ? parentComment.id : null,
		);

		let attachments = [];

		if (files && files.length > 0) {
			attachments = await this.s3.multiImageUpload(id, files);
		}

		await this.commentsRepository.addAttachments(id, attachments);

		return await this.commentsRepository.findOne(id, false);
	}

	async info(comment_id: string) {
		const comment = await this.commentsRepository.findOne(comment_id, false);

		if (comment === undefined) {
			throw new NotFoundException("Comment not found");
		}

		return comment;
	}

	async update(comment_id: string, user_id: string, content: string) {
		const comment = await this.commentsRepository.findOne(comment_id, true);

		if (comment === undefined) {
			throw new NotFoundException("Comment not found");
		}

		if (comment.userId !== user_id) {
			throw new UnauthorizedException("Forbidden");
		}

		const new_content =
			comment.content === content.trim() ? comment.content : content;

		return await this.commentsRepository.update(comment_id, new_content);
	}

	async delete(comment_id: string, user_id: string) {
		const comment = await this.commentsRepository.findOne(comment_id, true);

		if (comment === undefined) {
			throw new NotFoundException("Comment not found");
		}

		if (comment.userId !== user_id) {
			throw new UnauthorizedException("Forbidden");
		}

		await this.s3.deleteFiles(comment.attachments);

		await this.commentsRepository.delete(comment.id);

		return {};
	}

	async like(comment_id: string, user_id: string) {
		const comment = await this.commentsRepository.findOne(comment_id, true);

		if (comment === undefined) {
			throw new NotFoundException("Comment not found");
		}

		const is_comment_already_liked =
			await this.commentsRepository.isAlreadyLiked(comment.id, user_id);

		if (is_comment_already_liked) {
			await this.commentsRepository.dislike(comment.id, user_id);
			return {};
		}

		return await this.commentsRepository.like(user_id, comment.id);
	}
}
