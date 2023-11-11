import { Database } from "./types";
import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const sqlite = new SQLite("data/db.sqlite");
if (process.platform === "win32") {
  sqlite.loadExtension("crypto.dll");
} else {
  sqlite.loadExtension("crypto.so");
}
sqlite.pragma("journal_mode = WAL");

const dialect = new SqliteDialect({
  database: sqlite,
});

export const db = new Kysely<Database>({
  dialect,
});
