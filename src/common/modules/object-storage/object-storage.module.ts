import { DynamicModule, Module } from "@nestjs/common";
import { ObjectStorageCore } from "./object-storage.core";
import { ObjectStorageModuleOptions } from "./object-storage.interface";

/*
 * Disclaimer: using this module will break the command "dev:start" because it's using node.
 *             Docker deployment will work as usual.
 *
 * Implements Bun's S3 API, based on the package `nestjs-s3`
 *
 * Simple usage:
 *
 *  @Module({
 *    imports: [
 *		 ObjectStorageModule.forRoot({
 *			 clientOptions: {
 *				 accessKeyId: Environment.env.MINIO_ROOT_USER,
 *				 secretAccessKey: Environment.env.MINIO_ROOT_PASSWORD,
 *				 bucket: Environment.env.MINIO_DEFAULT_BUCKETS,
 *				 endpoint: Environment.env.MINIO_ENDPOINT,
 *			 },
 *		 }),
 *	 ],
 *	 controllers: [ObjectStorageExampleController],
 * })
 * export class ObjectStorageExampleModule {}
 *
 * @Controller()
 * export class ObjectStorageExampleController {
 *   // S3 from @common/modules/object-storage
 *   constructor(@ObjectStorage() private readonly s3: S3) {}
 *   @Get()
 *   async test() {
 *     const file = this.s3.file("hello.txt");
 *     await file.write("Hello, world!");
 *     return file.presign({
 *       expiresIn: 60 * 60 * 24,
 *       acl: "public-read",
 *     });
 *   }
 * }
 *
 * */

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: necessary static
export class ObjectStorageModule {
	public static forRoot(options: ObjectStorageModuleOptions): DynamicModule {
		return {
			module: ObjectStorageModule,
			imports: [ObjectStorageCore.forRoot(options)],
			exports: [ObjectStorageCore],
		};
	}
}
