import { S3Client, S3Options } from "bun";

export type S3 = S3Client;

export interface ObjectStorageModuleOptions {
	clientOptions: S3Options;
}
