import { Environment } from "@/environment";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthRepository } from "../repositories/auth.repository";

type Payload = {
	sub: string;
	iat: number;
	exp: number;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	"jwt-refresh",
) {
	constructor(private readonly authRepository: AuthRepository) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: Environment.env.JWT_ACCESS_SECRET,
		});
	}

	async validate(payload: Payload) {
		const user = await this.authRepository.findUser(payload.sub);

		if (!user) {
			throw new UnauthorizedException();
		}

		return {
			attributes: {
				id: user.id,
				displayName: user.displayName,
				username: user.username,
				createdAt: user.createdAt,
				profileImage: user.profileImage,
			},
			refreshTokenExpiresAt: new Date(payload.exp * 1000),
		};
	}
}
