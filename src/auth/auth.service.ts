import { UserModel } from "@/users/models/user.model";
import { UsersRepository } from "@/users/repository/users.repository";
import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { SignUpUserDTO } from "./dto/sign_up.dto";

@Injectable()
export class AuthService {
	constructor(
		private usersRepository: UsersRepository,
		private jwtService: JwtService,
	) {}

	async validateUser(
		username: string,
		password: string,
	): Promise<UserModel | null> {
		const user = await this.usersRepository.authSearch(username);

		if (user === undefined) {
			return null;
		}

		const validation = await argon2.verify(user.password, password);

		if (user && validation) {
			const { password, ...result } = user;
			return result;
		}

		return null;
	}

	async login(user: UserModel): Promise<{ token: string }> {
		const payload = {
			displayName: user.displayName,
			username: user.username,
			profileImage: user.profileImage,
			sub: user.id,
		};

		return {
			token: this.jwtService.sign(payload),
		};
	}

	async signUp({
		username,
		email,
		password,
	}: SignUpUserDTO): Promise<
		Pick<UserModel, "displayName" | "username" | "createdAt">
	> {
		if ((await this.usersRepository.findByUsername(username)) !== undefined) {
			throw new BadRequestException("Username already in use");
		}

		if ((await this.usersRepository.findByEmail(email)) !== undefined) {
			throw new BadRequestException("Email already in use");
		}

		const hash = await argon2.hash(password);

		return await this.usersRepository.create({
			username,
			email,
			password: hash,
		});
	}

	async updateEmail(id: string, email: string): Promise<{ message: string }> {
		const user = await this.usersRepository.findById(id);
		if (email !== undefined && email.trim() !== user.email) {
			const isAlreadyInUse = await this.usersRepository.findByEmail(email);
			if (isAlreadyInUse !== undefined && isAlreadyInUse.email !== user.email) {
				throw new BadRequestException("Email already in use");
			}

			await this.usersRepository.updateEmail(id, email);

			return { message: "Email updated successfully" };
		}
	}

	async updatePassword(
		id: string,
		old_password: string,
		new_password: string,
	): Promise<{ message: string }> {
		const user = await this.usersRepository.authSearch(id);

		const validatePassword = await argon2.verify(user.password, new_password);

		if (!validatePassword) {
			throw new BadRequestException("Wrong password");
		}

		const hash = await argon2.hash(new_password);

		await this.usersRepository.updatePassword(id, hash);

		return { message: "Password updated successfully" };
	}
}
