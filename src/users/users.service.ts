import { File } from "@nest-lab/fastify-multer";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { S3Service } from "src/services/s3/s3.service";
import { CreateUserDTO } from "./dto/create_user.dto";
import { UserModel } from "./models/user.model";
import { UsersRepository } from "./repository/users.repository";
import { User } from "./types/user.type";

@Injectable()
export class UserService {
	constructor(
		private readonly s3: S3Service,
		private readonly userRepository: UsersRepository,
	) {}
	async auth_search(username: string): Promise<UserModel> {
		return await this.userRepository.authSearch(username);
	}

	async info(username: string): Promise<UserModel> {
		const user = await this.userRepository.findByUsername(username);

		if (user === undefined) {
			throw new NotFoundException("User not found");
		}

		return user;
	}

	async create({
		username,
		email,
		password,
	}: CreateUserDTO): Promise<
		Pick<UserModel, "displayName" | "username" | "createdAt">
	> {
		if ((await this.userRepository.findByUsername(username)) !== undefined) {
			throw new BadRequestException("Username already in use");
		}

		if ((await this.userRepository.findByEmail(email)) !== undefined) {
			throw new BadRequestException("Email already in use");
		}

		const hash = await argon2.hash(password);

		return await this.userRepository.create({
			username,
			email,
			password: hash,
		});
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

	async updateEmail(id: string, email: string): Promise<{ message: string }> {
		const user = await this.userRepository.findById(id);

		if (email !== undefined && email.trim() !== user.email) {
			const isAlreadyInUse = await this.userRepository.findByEmail(email);
			if (isAlreadyInUse !== undefined && isAlreadyInUse.email !== user.email) {
				throw new BadRequestException("Email already in use");
			}

			await this.userRepository.updateEmail(id, email);

			return { message: "Email updated successfully" };
		}
	}

	async updateName(
		id: string,
		username: string | undefined,
		displayName: string,
	): Promise<Pick<User, "username" | "displayName">> {
		const user = await this.userRepository.findById(id);

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

	async updatePassword(
		id: string,
		old_password: string,
		new_password: string,
	): Promise<{ message: string }> {
		const user = await this.userRepository.authSearch(id);

		const validatePassword = await argon2.verify(user.password, old_password);

		if (!validatePassword) {
			throw new BadRequestException("Wrong password");
		}

		const hash = await argon2.hash(new_password);

		await this.userRepository.updatePassword(id, hash);

		return { message: "Password updated successfully" };
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
