import { UserModel } from "@/users/models/user.model";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<UserModel> {
		const user = await this.authService.validateUser(username, password);

		if (!user) {
			throw new UnauthorizedException("Wrong username or password");
		}

		return user;
	}
}
