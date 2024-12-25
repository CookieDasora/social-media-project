import { KyselyModule } from "@common/services/kysely/kysely.module";
import { FastifyMulterModule } from "@nest-lab/fastify-multer";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, seconds } from "@nestjs/throttler";
import { S3Module } from "nestjs-s3";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { Environment } from "./environment";
import { KweeksModule } from "./kweeks/kweeks.module";
import { UserModule } from "./users/users.module";

@Module({
	imports: [
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
