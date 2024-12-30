import { UserModel } from "@/users/models/user.model";
import { BadRequestException, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { AuthRefreshTokenService } from "./auth-refresh-token.service";
import { SignUpUserDTO } from "./dto/sign-up.dto";
import { AuthRepository } from "./repositories/auth.repository";

@Injectable()
export class AuthService {
	constructor(
		private authRepository: AuthRepository,
		private authRefreshTokenService: AuthRefreshTokenService,
	) {}

	async validateUser(
		username: string,
		password: string,
	): Promise<UserModel | null> {
		const user = await this.authRepository.findUser(username);

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

	async login(user: UserModel) {
		return await this.authRefreshTokenService.generateKeyPair(user.id);
	}

	async refresh(refreshToken: string) {
		return await this.authRefreshTokenService.refreshToken(refreshToken);
	}

	async signUp({
		username,
		email,
		password,
	}: SignUpUserDTO): Promise<
		Pick<UserModel, "displayName" | "username" | "createdAt">
	> {
		if ((await this.authRepository.findUser(username)) !== undefined) {
			throw new BadRequestException("Username already in use");
		}

		if ((await this.authRepository.findUserByEmail(email)) !== undefined) {
			throw new BadRequestException("Email already in use");
		}
		const hash = await argon2.hash(password);

		return await this.authRepository.createUser({
			username,
			email,
			password: hash,
		});
	}

	async updateEmail(id: string, email: string): Promise<{ message: string }> {
		const user = await this.authRepository.findUser(id);
		if (email !== undefined && email.trim() !== user.email) {
			const isAlreadyInUse = await this.authRepository.findUserByEmail(email);
			if (isAlreadyInUse !== undefined && isAlreadyInUse.email !== user.email) {
				throw new BadRequestException("Email already in use");
			}

			await this.authRepository.updateUserEmail(id, email);
			return { message: "Email updated successfully" };
		}
	}

	async updatePassword(
		id: string,
		old_password: string,
		new_password: string,
	): Promise<{ message: string }> {
		const user = await this.authRepository.findUser(id);
		const validatePassword = await argon2.verify(user.password, old_password);

		if (!validatePassword) {
			throw new BadRequestException("Wrong password");
		}

		const hash = await argon2.hash(new_password);
		await this.authRepository.updateUserPassword(id, hash);
		return { message: "Password updated successfully" };
	}
}
