import dotenv from "dotenv";
import dotEnvExpand from "dotenv-expand";
import { Singleton } from "tstl";

import { z } from "nestjs-zod/z";

/**
 * Global variables of the server.
 */
export class Environment {
	public static get env(): IEnvironment {
		return environments.get();
	}

	public static get node_env(): NodeEnv {
		if (nodeEnvWrapper.value === undefined || nodeEnvWrapper.value === null) {
			nodeEnvWrapper.value = environments.get().NODE_ENV;
		}
		return nodeEnvWrapper.value;
	}

	public setMode(mode: NodeEnv): void {
		if (!["dev", "prod"].includes(mode)) {
			throw new Error("Invalid NODE_ENV value, expected 'dev' or 'prod'");
		}
		nodeEnvWrapper.value = mode;
	}
}

const EnvironmentSchema = z.object({
	NODE_ENV: z.enum(["dev", "prod"]),

	POSTGRES_HOST: z.string(),
	POSTGRES_DB: z.string(),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_PORT: z.string().regex(/^[0-9]+$/),

	DATABASE_URL: z.string(),

	REDIS_HOST: z.string(),
	REDIS_PORT: z.string().regex(/^[0-9]+$/),
	REDIS_PASSWORD: z.string(),
	REDIS_URL: z.string(),

	SERVER_PORT: z.string().regex(/^[0-9]+$/),
	SERVER_HOST: z.string(),

	JWT_ACCESS_SECRET: z.string(),

	MINIO_ROOT_USER: z.string(),
	MINIO_ROOT_PASSWORD: z.string(),
	MINIO_DEFAULT_BUCKETS: z.string(),
	MINIO_ENDPOINT: z.string(),

	EMAIL_ID: z.string().email(),
	EMAIL_PASS: z.string(),
	EMAIL_HOST: z.string(),
	EMAIL_PORT: z.string().regex(/^[0-9]+$/),
});

type IEnvironment = z.infer<typeof EnvironmentSchema>;
type NodeEnv = "dev" | "prod";

interface INodeEnv {
	value?: NodeEnv;
}

const nodeEnvWrapper: INodeEnv = {};

const environments = new Singleton(() => {
	const env = dotenv.config();
	dotEnvExpand.expand(env);

	const parsedEnv = EnvironmentSchema.safeParse(process.env);

	if (!parsedEnv.success) {
		const errors = parsedEnv.error.format();
		throw new Error(`Environment validation failed: ${JSON.stringify(errors)}`);
	}

	return parsedEnv.data;
});
