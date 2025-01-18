import {
	DynamicModule,
	Global,
	Inject,
	Module,
	Provider,
} from "@nestjs/common";
import { S3Client, S3Options } from "bun";

// Constants
export const CONNECTION = "default";
export const CONNECTION_TOKEN = "ObjectStorageModuleConnectionToken";
export const OPTIONS_TOKEN = "ObjectStorageModuleOptionsToken";

// Interfaces
export type S3 = S3Client;
export interface ModuleOptions {
	options: S3Options;
}

// Helpers
export function getOptionsToken(connection: string): string {
	return `${connection || CONNECTION}_${OPTIONS_TOKEN}`;
}

export function getConnectionToken(connection: string): string {
	return `${connection || CONNECTION}_${CONNECTION_TOKEN}`;
}

export function createConnection({ options }: ModuleOptions): S3Client {
	return new S3Client(options);
}

// Decorator
export const ObjectStorage = (connection: string = CONNECTION) =>
	Inject(getConnectionToken(connection));

// Core Module
@Global()
@Module({})
class ObjectStorageCoreModule {
	static forRoot(
		options: ModuleOptions,
		connection: string = CONNECTION,
	): DynamicModule {
		const optionsProvider: Provider = {
			provide: getOptionsToken(connection),
			useValue: options,
		};
		const connectionProvider: Provider = {
			provide: getConnectionToken(connection),
			useFactory: () => createConnection(options),
		};
		return {
			module: ObjectStorageCoreModule,
			providers: [optionsProvider, connectionProvider],
			exports: [optionsProvider, connectionProvider],
		};
	}
}

// Main Module
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: necessary static
export class ObjectStorageModule {
	static forRoot(options: ModuleOptions): DynamicModule {
		return {
			module: ObjectStorageModule,
			imports: [ObjectStorageCoreModule.forRoot(options)],
			exports: [ObjectStorageCoreModule],
		};
	}
}
