import { type APIEvent } from "solid-start";
import { nanoid } from "nanoid";
import { createPaste } from "~/data/paste";
import { CreatePasteDto } from "~/data/types";
import { encrypt } from "~/util";

export async function POST({ request }: APIEvent) {
  let body: CreatePasteDto;

  const contentType = request.headers.get("content-type");
  let passphrase: string | undefined;
  if (contentType?.startsWith("multipart/form-data")) {
    const formData = await request.formData();
    passphrase = formData.get("passphrase") as string;
    const value = formData.get("content") as string | File;
    let content: ArrayBuffer;
    let mime: string | undefined;
    if (typeof value === "string") {
      body = {
        id: formData.get("id") as string,
        content: new TextEncoder().encode(value),
        type: formData.get("type") as "text" | "link" | "file",
        mime,
      };
    } else {
      content = await value.arrayBuffer();
      mime = value.type;
      body = {
        id: formData.get("id") as string,
        content: await value.arrayBuffer(),
        type: formData.get("type") as "text" | "link" | "file",
        mime: value.type,
        filename: value.name,
      };
    }
  } else {
    ({ passphrase, ...body } = (await new Response(
      request.body
    ).json()) as CreatePasteDto & { passphrase?: string });
  }

  if (!body.id) {
    body.id = nanoid(4);
  }

  if (passphrase) {
    const value = await encrypt(body.content, passphrase);
    body.content = value.ciphertext;
    body.salt = value.salt;
    body.iv = value.iv;
  }

  const paste = await createPaste(body);

  return new Response(paste.id, {
    status: 201,
    headers: { "Content-Type": "text/plain" },
  });
}
