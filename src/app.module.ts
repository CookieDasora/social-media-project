import { KyselyModule } from "@common/modules/kysely/kysely.module";
import { MailModule } from "@common/modules/mail/mail.module";
import { QueueModule } from "@common/modules/queue/queue.module";
import { StorageModule } from "@common/modules/s3/s3.module";
import { FastifyMulterModule } from "@nest-lab/fastify-multer";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, seconds } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { Environment } from "./environment";
import { KweeksModule } from "./kweeks/kweeks.module";
import { UserModule } from "./users/users.module";

@Module({
	imports: [
		LoggerModule.forRoot({
			pinoHttp: {
				transport: {
					target: "pino-pretty",
				},
			},
		}),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					limit: 10,
					ttl: seconds(60),
					skipIf: () => {
						return Environment.env.NODE_ENV === "dev";
					},
				},
			],
			storage: new ThrottlerStorageRedisService(Environment.env.REDIS_URL),
			errorMessage: "Too many requests",
		}),
		KyselyModule.forRootAsync({
			useFactory: () => ({
				host: Environment.env.POSTGRES_HOST,
				port: Number(Environment.env.POSTGRES_PORT),
				user: Environment.env.POSTGRES_USER,
				password: Environment.env.POSTGRES_PASSWORD,
				database: Environment.env.POSTGRES_DB,
			}),
		}),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MailModule,
		FastifyMulterModule,
		UserModule,
		KweeksModule,
		AuthModule,
		StorageModule,
		QueueModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
