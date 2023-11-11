import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("pastes")
    .addColumn("type", "text", (col) =>
      col.check(sql`type IN ('text', 'link', 'file')`)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("pastes").dropColumn("type").execute();
}
