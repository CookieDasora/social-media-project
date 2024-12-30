import { Environment } from "@/environment";
import { S3Service } from "@common/modules/s3/s3.service";
import { Module } from "@nestjs/common";
import { S3Module } from "nestjs-s3";

@Module({
	providers: [S3Service],
	imports: [
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
	exports: [S3Service],
})
export class StorageModule {}
