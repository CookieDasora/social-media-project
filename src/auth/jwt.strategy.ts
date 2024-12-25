import { Environment } from "@/environment";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type Payload = {
	displayName: string;
	username: string;
	sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: Environment.env.JWT_ACCESS_SECRET,
		});
	}

	async validate(payload: Payload) {
		return {
			displayName: payload.displayName,
			username: payload.username,
			id: payload.sub,
		};
	}
}
