import { Environment } from "@/environment";
import { UserModel } from "@/users/models/user.model";
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
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authRepository: AuthRepository) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: Environment.env.JWT_ACCESS_SECRET,
		});
	}

	async validate(
		payload: Payload,
	): Promise<Pick<
		UserModel,
		"id" | "displayName" | "username" | "createdAt" | "profileImage"
	> | null> {
		const user = await this.authRepository.findUser(payload.sub);
		if (!user) {
			throw new UnauthorizedException();
		}
		const { id, displayName, username, createdAt, profileImage } = user;
		return { id, displayName, username, createdAt, profileImage };
	}
}
