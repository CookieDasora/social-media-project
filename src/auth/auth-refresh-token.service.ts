import { Environment } from "@/environment";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
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
		const refreshToken = this.jwtService.sign(
			{ sub: userId },
			{ secret: Environment.env.JWT_ACCESS_SECRET, expiresIn: "7d" },
		);
		await this.authRepository.storeRefreshToken(refreshToken, userId);
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

	async refreshToken(refreshToken: string, userId: string) {
		const token = await this.authRepository.findRefreshToken(
			refreshToken,
			userId,
		);
		if (!token) {
			throw new UnauthorizedException("Invalid refresh token provided");
		}
		if (token.expiryDate.getTime() < Date.now()) {
			throw new UnauthorizedException("Invalid refresh token provided");
		}

		return this.generateKeyPair(token.userId);
	}
}
