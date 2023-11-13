import { db } from "./database";
import { CreatePasteDto, PasteDto } from "./types";

export async function findPasteById(id: string): Promise<PasteDto> {
  const { deleteCode, ...data } = await db
    .selectFrom("pastes")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();
  const paste: PasteDto = {
    ...data,
    content: data.content.buffer,
  };
  return paste;
  // const row = db
  //   .prepare("SELECT * FROM pastes WHERE id = ? LIMIT 1")
  //   .get(id) as any;
  // return {
  //   id: row.id,
  //   content: row.content,
  //   type: row.type,
  //   salt: row.salt,
  //   iv: row.iv,
  //   created: row.created,
  // };
}

export async function createPaste(paste: CreatePasteDto) {
  return await db
    .insertInto("pastes")
    .values({ ...paste, content: Buffer.from(paste.content) })
    .returningAll()
    .executeTakeFirstOrThrow();
  // const row = db
  //   .prepare(
  //     "INSERT INTO pastes (id, content, type, salt, iv) VALUES (?, ?, ?, ?, ?) RETURNING *"
  //   )
  //   .get(paste.id, paste.content, paste.type, paste.salt, paste.iv) as any;
  // return {
  //   id: row.id,
  //   content: row.content,
  //   type: row.type,
  //   salt: row.salt,
  //   iv: row.iv,
  //   created: row.created,
  // };
}

export async function attemptDeletePaste(id: string, deleteCode: string) {
  const [{ numDeletedRows }] = await db
    .deleteFrom("pastes")
    .where("id", "=", id)
    .where("deleteCode", "=", deleteCode)
    .execute();
  return numDeletedRows === 1n;
}
