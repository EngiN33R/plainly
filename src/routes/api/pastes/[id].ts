import { type APIEvent } from "solid-start/api";
import { findPasteById } from "~/data/paste";
import { decrypt } from "~/util";

export async function GET({ params, request }: APIEvent) {
  const { id } = params;
  const passphrase = new URL(request.url).searchParams.get("passphrase") ?? "";

  const paste = await findPasteById(id);
  if (paste?.iv && paste?.salt) {
    const { plaintext } = await decrypt(
      paste.content,
      passphrase,
      paste.iv,
      paste.salt
    );

    if (paste.type === "link") {
      return new Response("Redirecting...", {
        status: 302,
        headers: { Location: plaintext },
      });
    }

    return new Response(plaintext, {
      headers: { "Content-Type": "text/plain" },
    });
  } else {
    return new Response(paste.content, {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
