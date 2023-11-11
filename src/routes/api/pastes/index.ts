import { type APIEvent } from "solid-start";
import { nanoid } from "nanoid";
import { createPaste } from "~/data/paste";
import { CreatePasteDto } from "~/data/types";
import { encrypt } from "~/util";

export async function POST({ request }: APIEvent) {
  let body: CreatePasteDto & { passphrase?: string };

  const contentType = request.headers.get("content-type");
  if (contentType === "application/x-www-form-urlencoded") {
    const formData = await new Response(request.body).formData();
    body = {
      id: formData.get("content") as string,
      content: formData.get("content") as string,
      type: formData.get("type") as "text" | "link" | "file",
      passphrase: formData.get("passphrase") as string,
    };
  } else {
    body = await new Response(request.body).json();
  }

  if (!body.id) {
    body.id = nanoid(4);
  }

  if (body.passphrase) {
    const value = await encrypt(body.content, body.passphrase);
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
