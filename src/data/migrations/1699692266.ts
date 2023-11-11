import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("pastes").addColumn("mime", "text").execute();
  await db.schema
    .alterTable("pastes")
    .addColumn("content_blob", "blob")
    .execute();
  await db
    .updateTable("pastes")
    .where("iv", "is not", null)
    .set({
      content_blob: sql`decode(cast(content AS TEXT), 'base64')`,
    })
    .execute();
  await db
    .updateTable("pastes")
    .where("iv", "is", null)
    .set({
      content_blob: sql`content`,
    })
    .execute();
  await db.schema.alterTable("pastes").dropColumn("content").execute();
  await db.schema
    .alterTable("pastes")
    .renameColumn("content_blob", "content")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("pastes")
    .addColumn("content_text", "text")
    .execute();
  await db
    .updateTable("pastes")
    .where("iv", "is not", null)
    .set({
      content_text: sql`encode(content, 'base64')`,
    })
    .execute();
  await db
    .updateTable("pastes")
    .where("iv", "is", null)
    .set({
      content_text: sql`cast(content AS TEXT)`,
    })
    .execute();
  await db.schema.alterTable("pastes").dropColumn("content").execute();
  await db.schema
    .alterTable("pastes")
    .renameColumn("content_text", "content")
    .execute();
}
