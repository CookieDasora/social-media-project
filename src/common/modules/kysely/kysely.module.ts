import { Global, Module } from "@nestjs/common";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import {
	ConfigurableDatabaseModule,
	DATABASE_OPTIONS,
	DatabaseOptions,
} from "./kysely.definition";
import { Database } from "./kysely.service";

@Global()
@Module({
	exports: [Database],
	providers: [
		{
			provide: Database,
			inject: [DATABASE_OPTIONS],
			useFactory: ({
				host,
				port,
				user,
				password,
				database,
			}: DatabaseOptions) => {
				const dialect = new PostgresDialect({
					pool: new Pool({
						host,
						port,
						user,
						password,
						database,
					}),
				});

				return new Database({ dialect });
			},
		},
	],
})
export class KyselyModule extends ConfigurableDatabaseModule {}
