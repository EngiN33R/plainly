import { type APIEvent } from "solid-start";
import { attemptDeletePaste, findPasteById } from "~/data/paste";

export async function POST({ params, request }: APIEvent) {
  const { id } = params;

  if (process.env.API_KEY) {
    const apiKey = request.headers.get("x-api-key");
    if (process.env.API_KEY !== apiKey) {
      return new Response("Invalid API key", { status: 401 });
    }
  }

  const contentType = request.headers.get("content-type");
  let deleteCode: string;
  if (contentType?.startsWith("multipart/form-data")) {
    const formData = await request.formData();
    deleteCode = formData.get("delete_code") as string;
  } else {
    ({ deleteCode } = await request.json());
  }

  if (!deleteCode) {
    return new Response("Missing required fields", { status: 400 });
  }

  const isDeleted = await attemptDeletePaste(id, deleteCode);
  if (!isDeleted) {
    const paste = await findPasteById(id);
    if (!paste) {
      return new Response(`Paste ${id} does not exist`, { status: 404 });
    } else {
      return new Response("Invalid delete code", { status: 401 });
    }
  }
  return new Response(undefined, { status: 200 });
}
