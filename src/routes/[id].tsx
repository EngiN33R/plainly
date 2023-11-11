import { Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { findPasteById } from "~/data/paste";
import { decrypt } from "~/util";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ([, id]) => {
      const data = await findPasteById(id);
      if (data.type === "link" && !data.iv) {
        throw redirect(data.content);
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

  // const content = createMemo(() =>
  //   paste()?.iv ? decoded() : paste()?.content
  // );

  createEffect(() => {
    const fetched = paste();
    const decodedValue = decoded();
    const content = document.getElementById(
      "content"
    ) as HTMLTextAreaElement | null;
    if (content) {
      if (fetched?.iv && fetched?.salt) {
        content.value = decodedValue;
      } else {
        content.value = fetched?.content || "";
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
              if (value.type === "link") {
                location.href = plaintext;
              } else {
                setDecoded(plaintext);
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
          <button
            type="submit"
            class="w-full bg-slate-800 hover:bg-slate-900 px-8 py-3 rounded-md text-white font-semibold text-2xl transition-all duration-200 ease-in-out"
          >
            Download
          </button>
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
