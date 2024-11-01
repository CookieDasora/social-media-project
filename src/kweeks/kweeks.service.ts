import { File } from "@nest-lab/fastify-multer";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { S3Service } from "src/services/s3/s3.service";
import { KweeksRepository } from "./repository/kweeks.repository";

@Injectable()
export class KweeksService {
	constructor(
		private readonly kweekRepository: KweeksRepository,
		private readonly s3: S3Service,
	) {}
	async create(content: string, authorId: string, files: Array<File>) {
		if (content.length > 300) {
			throw new BadRequestException(
				"Content too big. Must have 300 characters or lower",
			);
		}

		const { id } = await this.kweekRepository.create(content, authorId);

		let attachments = [];

		if (files && files.length > 0) {
			attachments = await this.s3.multiImageUpload(id, files);
		}

		await this.kweekRepository.addAttachments(id, attachments);

		return await this.kweekRepository.findOne(id, false);
	}

	async findOne(id: string) {
		const post = await this.kweekRepository.findOne(id, false);

		if (post === undefined) {
			throw new NotFoundException("Post not found");
		}

		return post;
	}

	async update(user_id: string, post_id: string, content: string) {
		const post = await this.kweekRepository.findOne(post_id, true);

		if (post === undefined) {
			throw new NotFoundException("Post not found");
		}

		if (post.authorId !== user_id) {
			throw new UnauthorizedException("Forbidden");
		}

		const new_content =
			post.content === content.trim() ? post.content : content;

		return await this.kweekRepository.update(post_id, new_content);
	}

	async remove(user_id: string, id: string) {
		const post = await this.kweekRepository.findOne(id, true);

		if (post === undefined) {
			throw new NotFoundException("Post not found");
		}

		if (post.authorId !== user_id) {
			throw new UnauthorizedException("Forbidden");
		}

		await this.s3.deleteFiles(post.attachments);

		await this.kweekRepository.delete(id);

		return {};
	}

	async like(user_id: string, kweek_id: string) {
		const kweek = await this.kweekRepository.findOne(kweek_id, true);

		if (kweek === undefined) {
			throw new NotFoundException("Post not found");
		}

		const is_kweek_already_liked = await this.kweekRepository.isAlreadyLiked(
			kweek.id,
			user_id,
		);

		if (is_kweek_already_liked) {
			await this.kweekRepository.dislike(kweek.id, user_id);

			return {};
		}

		return await this.kweekRepository.like(user_id, kweek.id);
	}
}
