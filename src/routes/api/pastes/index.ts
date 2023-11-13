import { type APIEvent } from "solid-start";
import { nanoid } from "nanoid";
import { createPaste } from "~/data/paste";
import { CreatePasteDto } from "~/data/types";
import { encrypt } from "~/util";

export async function POST({ request }: APIEvent) {
  if (process.env.API_KEY) {
    const apiKey = request.headers.get("x-api-key");
    if (process.env.API_KEY !== apiKey) {
      return new Response("Invalid API key", { status: 401 });
    }
  }

  let body: CreatePasteDto;

  const contentType = request.headers.get("content-type");
  let passphrase: string | undefined;
  if (contentType?.startsWith("multipart/form-data")) {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const type = formData.get("type") as "text" | "link" | "file";
    const value = formData.get("content") as string | File | null;
    const deleteCode = formData.get("delete_code") as string;
    passphrase = formData.get("passphrase") as string;

    if (!type || !value) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (typeof value === "string") {
      body = {
        id,
        content: new TextEncoder().encode(value),
        type,
        deleteCode,
      };
    } else {
      body = {
        id,
        content: await value.arrayBuffer(),
        type,
        mime: value.type,
        filename: value.name,
        deleteCode,
      };
    }
  } else {
    ({ passphrase, ...body } = (await request.json()) as CreatePasteDto & {
      passphrase?: string;
    });
  }

  if (!body.id) {
    body.id = nanoid(4);
  }
  if (!body.deleteCode) {
    body.deleteCode = nanoid(5);
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
    headers: { "Content-Type": "text/plain", "X-Delete-Code": body.deleteCode },
  });
}
