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
}

export async function createPaste(paste: CreatePasteDto) {
  return await db
    .insertInto("pastes")
    .values({ ...paste, content: Buffer.from(paste.content) })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function attemptDeletePaste(id: string, deleteCode: string) {
  const [{ numDeletedRows }] = await db
    .deleteFrom("pastes")
    .where("id", "=", id)
    .where("deleteCode", "=", deleteCode)
    .execute();
  return numDeletedRows === 1n;
}
