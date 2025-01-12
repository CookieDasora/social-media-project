import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { ObjectStorageModuleOptions } from "./object-storage.interface";
import {
	createConnection,
	getObjectStorageConnectionToken,
	getObjectStorageOptionsToken,
} from "./object-storage.utils";

@Global()
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: necessary static.
export class ObjectStorageCore {
	static forRoot(
		options: ObjectStorageModuleOptions,
		connection?: string,
	): DynamicModule {
		const objectStorageOptionsProvider: Provider = {
			provide: getObjectStorageOptionsToken(connection),
			useValue: options,
		};

		const objectStorageConnectionProvider: Provider = {
			provide: getObjectStorageConnectionToken(connection),
			useValue: createConnection(options),
		};

		return {
			module: ObjectStorageCore,
			providers: [
				objectStorageOptionsProvider,
				objectStorageConnectionProvider,
			],
			exports: [objectStorageOptionsProvider, objectStorageConnectionProvider],
		};
	}
}
