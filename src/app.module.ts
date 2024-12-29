import { KyselyModule } from "@common/services/kysely/kysely.module";
import { FastifyMulterModule } from "@nest-lab/fastify-multer";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { RedisModule } from "@nestjs-modules/ioredis";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, seconds } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { S3Module } from "nestjs-s3";
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
		FastifyMulterModule,
		UserModule,
		KweeksModule,
		AuthModule,
		S3Module.forRoot({
			config: {
				credentials: {
					accessKeyId: Environment.env.MINIO_ROOT_USER,
					secretAccessKey: Environment.env.MINIO_ROOT_PASSWORD,
				},
				region: "us-east-1",
				endpoint: Environment.env.MINIO_ENDPOINT,
				forcePathStyle: true,
			},
		}),
		MailerModule.forRoot({
			transport: {
				host: Environment.env.EMAIL_HOST,
				port: Number(Environment.env.EMAIL_PORT),
				auth: {
					user: Environment.env.EMAIL_ID,
					pass: Environment.env.EMAIL_PASS,
				},
			},
			defaults: {
				from: `Project Knedita <${Environment.env.EMAIL_ID}>`,
			},
		}),
		RedisModule.forRoot({
			type: "single",
			url: Environment.env.REDIS_URL,
		}),
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
