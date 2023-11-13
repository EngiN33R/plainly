import { type APIEvent } from "solid-start/api";
import { findPasteById } from "~/data/paste";
import { decrypt } from "~/util";

export async function GET({ params, request }: APIEvent) {
  const { id } = params;
  const passphrase = new URL(request.url).searchParams.get("passphrase") ?? "";
  const decoder = new TextDecoder("utf-8");

  const paste = await findPasteById(id);
  let content: ArrayBuffer = paste.content;
  if (paste?.iv && paste?.salt) {
    ({ plaintext: content } = await decrypt(
      paste.content,
      passphrase,
      paste.iv,
      paste.salt
    ));
  }

  if (paste.type === "link") {
    const url = decoder.decode(content);
    return new Response("Redirecting...", {
      status: 302,
      headers: { Location: url },
    });
  }

  if (paste.type === "file") {
    return new Response(content, {
      headers: {
        "Content-Type": paste.mime ?? "text/plain",
        "Content-Length": String(content.byteLength),
        "Content-Disposition": `attachment; filename=${
          paste.filename ?? paste.id
        }`,
      },
    });
  }

  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
