import {
  Accessor,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
} from "solid-js";
import { PasteDto } from "~/data/types";
import { blobToDataURL } from "~/util";

export function FileView({
  paste,
  decoded,
}: {
  paste: Accessor<PasteDto | undefined>;
  decoded: Accessor<string>;
}) {
  const [content, setContent] = createSignal("");

  createEffect(async () => {
    const value = paste();
    const decodedValue = decoded();
    if (!value) return;
    if (value.iv && !decodedValue) return;
    if (value.iv && decodedValue) {
      setContent(decodedValue);
    } else {
      const data = await blobToDataURL(
        new Blob([value.content], {
          type: value.mime ?? "text/plain",
        })
      );
      setContent(data);
    }
  });

  return (
    <>
      <Show when={content()}>
        <Switch>
          <Match when={paste()?.mime?.startsWith("text")}>
            <div class="flex flex-1 flex-col gap-2">
              <textarea
                id="preview"
                class="flex-1 py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
                readonly
                value={content()}
              />
            </div>
          </Match>
          <Match when={content()?.startsWith("data:image")}>
            <div class="flex flex-1 flex-col gap-2">
              <img
                id="preview"
                class="w-min mx-auto"
                // class="flex-1 py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
                src={content()}
              />
            </div>
          </Match>
        </Switch>
        <a
          href={content()}
          download={paste()?.filename ?? paste()?.id}
          type="submit"
          class="w-full text-center bg-slate-800 hover:bg-slate-900 px-8 py-3 rounded-md text-white font-semibold text-2xl transition-all duration-200 ease-in-out"
        >
          Download
        </a>
      </Show>
    </>
  );
}
