import {
  StartServer,
  createHandler,
  renderAsync,
} from "solid-start/entry-server";
import { Migrator } from "kysely";
import { db } from "./data/database";
import * as migrations from "./data/migrations";

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: {
      getMigrations: async () => migrations,
    },
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
  }
}

migrateToLatest();

export default createHandler(
  renderAsync((event) => <StartServer event={event} />)
);
