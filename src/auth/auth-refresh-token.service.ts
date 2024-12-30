import { Environment } from "@/environment";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createId } from "@paralleldrive/cuid2";
import * as argon2 from "argon2";
import { AuthRepository } from "./repositories/auth.repository";

@Injectable()
export class AuthRefreshTokenService {
	constructor(
		private jwtService: JwtService,
		private readonly authRepository: AuthRepository,
	) {}
	async generateAccessToken(userId: string): Promise<string> {
		return this.jwtService.signAsync({ sub: userId });
	}

	async generateRefreshToken(userId: string): Promise<string> {
		const refreshToken = createId();
		const hashedToken = await argon2.hash(refreshToken, {
			salt: Buffer.from(Environment.env.ARGON_SECRET),
		});
		await this.authRepository.storeRefreshToken(hashedToken, userId);
		return refreshToken;
	}

	async generateKeyPair(userId: string) {
		const accessToken = await this.generateAccessToken(userId);
		const refreshToken = await this.generateRefreshToken(userId);
		return {
			accessToken,
			refreshToken,
		};
	}

	async refreshToken(refreshToken: string) {
		const hashedToken = await argon2.hash(refreshToken, {
			salt: Buffer.from(Environment.env.ARGON_SECRET),
		});
		const token = await this.authRepository.findRefreshToken(hashedToken);
		if (!token) {
			throw new UnauthorizedException("Invalid refresh token provided");
		}
		if (token.expiryDate.getTime() < Date.now()) {
			throw new UnauthorizedException("Invalid refresh token provided");
		}

		return this.generateKeyPair(token.userId);
	}
}
