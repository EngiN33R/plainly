import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  pastes: PasteTable;
}

export interface PasteTable {
  id: string;
  content: string;
  type: "text" | "link" | "file";
  salt: string | null;
  iv: string | null;
  created: ColumnType<Date, string | undefined, never>;
}

export type PasteDto = Selectable<PasteTable>;
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
