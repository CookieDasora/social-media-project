import { S3Service } from "@common/services/s3/s3.service";
import { File } from "@nest-lab/fastify-multer";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { UserModel } from "./models/user.model";
import { UsersRepository } from "./repository/users.repository";

@Injectable()
export class UserService {
	constructor(
		private readonly s3: S3Service,
		private readonly userRepository: UsersRepository,
	) {}
	async info(username: string): Promise<UserModel> {
		// TODO: Add pagination
		const user = await this.userRepository.findByUsername(username);

		if (user === undefined) {
			throw new NotFoundException("User not found");
		}

		return user;
	}

	async follow(authenticated_id: string, username: string) {
		const user_to_follow = await this.userRepository.findByUsername(username);

		if (user_to_follow === undefined) {
			throw new NotFoundException("User to follow not found");
		}

		const is_already_following = await this.userRepository.isFollowing(
			user_to_follow.id,
			authenticated_id,
		);

		if (is_already_following) {
			await this.userRepository.unfollow(user_to_follow.id, authenticated_id);
			return {};
		}

		return await this.userRepository.follow(
			user_to_follow.id,
			authenticated_id,
		);
	}

	async updateName(
		id: string,
		username: string | undefined,
		displayName: string,
	): Promise<Pick<UserModel, "username" | "displayName">> {
		const user = await this.userRepository.findById(id);

		if (username !== undefined && username.trim() === "") {
			throw new BadRequestException("Username cannot be an empty string");
		}

		if (username !== undefined && username.trim() !== user.username) {
			const isAlreadyInUse = await this.userRepository.findByUsername(username);
			if (
				isAlreadyInUse !== undefined &&
				isAlreadyInUse.username !== user.username
			) {
				throw new BadRequestException("Username already in use");
			}
		}

		return await this.userRepository.updateUsername(id, username, displayName);
	}

	async uploadImage(id: string, image: File) {
		const url = await this.s3.uploadImage(id, image.buffer);

		return await this.userRepository.updateProfileImage(id, url);
	}

	async delete(id: string) {
		await this.userRepository.delete(id);
		return { message: "User deleted" };
	}
}
