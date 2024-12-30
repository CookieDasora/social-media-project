import { Kysely } from "kysely";
import { DB } from "src/db/types";

export class Database extends Kysely<DB> {}
