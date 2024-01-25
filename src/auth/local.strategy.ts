import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";
import { UserModel } from "src/user/models/user.model";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
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
