import { Inject } from "@nestjs/common";
import { getObjectStorageConnectionToken } from "./object-storage.utils";

export const ObjectStorage = (connection?: string) => {
	return Inject(getObjectStorageConnectionToken(connection));
};
