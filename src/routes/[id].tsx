import { Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { FileView } from "~/components/FileView";
import { findPasteById } from "~/data/paste";
import { blobToDataURL, decrypt } from "~/util";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ([, id]) => {
      const data = await findPasteById(id);
      if (data.type === "link" && !data.iv) {
        throw redirect(new TextDecoder("utf-8").decode(data.content));
      }
      return data;
    },
    {
      key: ["pastes", params.id],
    }
  );
}

export default function View() {
  const paste = useRouteData<typeof routeData>();
  const [decoded, setDecoded] = createSignal("");

  createEffect(async () => {
    const fetched = paste();
    const decodedValue = decoded();
    const content = document.getElementById(
      "content"
    ) as HTMLTextAreaElement | null;
    if (fetched && fetched.type !== "file" && content) {
      if (fetched.iv && fetched.salt) {
        content.value = decodedValue;
        content.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        content.value = new TextDecoder("utf-8").decode(fetched.content);
      }
    }
  });

  return (
    <div class="mx-auto flex flex-col max-w-7xl gap-4 h-full pt-4 pb-12">
      <h1 class="text-center text-4xl font-semibold text-white">
        Shared{" "}
        <Switch fallback={<span>content</span>}>
          <Match when={paste()?.type === "text"}>
            <span>text</span>
          </Match>
          <Match when={paste()?.type === "link"}>
            <span>link</span>
          </Match>
          <Match when={paste()?.type === "file"}>
            <span>file</span>
          </Match>
        </Switch>
      </h1>
      <Show when={paste()?.type === "file"}>
        <h2 class="text-center text-2xl font-semibold text-white">
          {paste()?.filename}
        </h2>
      </Show>
      <Show when={paste()?.iv}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const value = paste();
            if (value?.iv && value?.salt) {
              const { plaintext } = await decrypt(
                value.content,
                data.get("passphrase") as string,
                value.iv,
                value.salt
              );
              const decoder = new TextDecoder("utf-8");
              if (value.type === "link") {
                const dec = decoder.decode(plaintext);
                location.href = dec;
              } else if (value.type === "text") {
                const dec = decoder.decode(plaintext);
                setDecoded(dec);
              } else if (value.type === "file") {
                setDecoded(
                  await blobToDataURL(
                    new Blob([plaintext], { type: value.mime ?? "text/plain" })
                  )
                );
              }
            }
          }}
          class="flex flex-col gap-2"
        >
          <label for="key" class="font-semibold text-white">
            Passphrase
          </label>
          <div class="flex gap-2 items-center">
            <input
              id="passphrase"
              name="passphrase"
              type="password"
              class="flex-1 py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white disabled:opacity-70 disabled:cursor-not-allowed"
            />
            <button class="bg-blue-800 hover:bg-blue-900 px-6 h-full rounded-md text-white font-semibold text-md">
              <Switch>
                <Match when={paste()?.type === "link"}>Continue to link</Match>
                <Match when={paste()?.type !== "link"}>Decrypt</Match>
              </Switch>
            </button>
          </div>
        </form>
      </Show>
      <Switch>
        <Match when={paste()?.type === "file"}>
          <FileView paste={paste} decoded={decoded} />
        </Match>
        <Match when={paste()?.type === "text"}>
          <div class="flex flex-1 flex-col gap-2">
            <label for="content" class="font-semibold text-white">
              Content
            </label>
            <textarea
              id="content"
              class="flex-1 py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
              placeholder={paste() ? "Passphrase required" : "Loading..."}
              readonly
            />
          </div>
        </Match>
      </Switch>
    </div>
  );
}
