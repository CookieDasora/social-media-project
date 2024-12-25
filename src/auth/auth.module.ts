import { Environment } from "@/environment";
import { UsersRepository } from "@/users/repository/users.repository";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";

@Module({
	controllers: [AuthController],
	imports: [
		PassportModule,
		JwtModule.register({
			secret: Environment.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: "1d" }, // TODO: add refresh tokens
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy, UsersRepository],
})
export class AuthModule {}
