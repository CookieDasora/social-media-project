import { Environment } from "@/environment";
import { RedisModule } from "@nestjs-modules/ioredis";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthRefreshTokenService } from "./auth-refresh-token.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./repositories/auth.repository";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
	controllers: [AuthController],
	imports: [
		PassportModule,
		JwtModule.register({
			secret: Environment.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: "30s" },
		}),
		RedisModule,
	],
	providers: [
		AuthRepository,
		AuthService,
		AuthRefreshTokenService,
		LocalStrategy,
		JwtStrategy,
	],
})
export class AuthModule {}
