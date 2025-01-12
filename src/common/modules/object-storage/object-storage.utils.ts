import { S3Client } from "bun";
import {
	OBJECT_STORAGE_MODULE_CONNECTION,
	OBJECT_STORAGE_MODULE_CONNECTION_TOKEN,
	OBJECT_STORAGE_MODULE_OPTIONS_TOKEN,
} from "./object-storage.constants";
import { ObjectStorageModuleOptions } from "./object-storage.interface";

export function getObjectStorageOptionsToken(connection: string): string {
	return `${
		connection || OBJECT_STORAGE_MODULE_CONNECTION
	}_${OBJECT_STORAGE_MODULE_OPTIONS_TOKEN}`;
}

export function getObjectStorageConnectionToken(connection: string): string {
	return `${
		connection || OBJECT_STORAGE_MODULE_CONNECTION
	}_${OBJECT_STORAGE_MODULE_CONNECTION_TOKEN}`;
}

export function createConnection({
	clientOptions,
}: ObjectStorageModuleOptions): S3Client {
	return new S3Client(clientOptions);
}
