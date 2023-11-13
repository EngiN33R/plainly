import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  pastes: PasteTable;
}

export interface PasteTable {
  id: string;
  content: ColumnType<Buffer, ArrayBuffer, ArrayBuffer>;
  type: "text" | "link" | "file";
  mime: string | null;
  filename: string | null;
  salt: string | null;
  iv: string | null;
  deleteCode: string;
  created: ColumnType<Date, string | undefined, never>;
}

export type RawPasteDto = Selectable<PasteTable>;
export type PasteDto = Omit<RawPasteDto, "content" | "deleteCode"> & {
  content: ArrayBuffer;
};
export type CreatePasteDto = Insertable<PasteTable>;
export type UpdatePasteDto = Updateable<PasteTable>;

// export interface PasteDto {
//   id: string;
//   content: string;
//   type: "text" | "link" | "file";
//   salt?: string;
//   iv?: string;
//   created?: string;
// }
// export type CreatePasteDto = PasteDto;
// export type UpdatePasteDto = PasteDto;
