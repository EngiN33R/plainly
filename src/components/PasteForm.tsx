import { nanoid } from "nanoid";
import { Accessor, JSX, Match, Show, Switch, createSignal } from "solid-js";
import { A } from "solid-start";
import { createServerAction$, createServerData$ } from "solid-start/server";
import { createPaste } from "~/data/paste";
import { CreatePasteDto, PasteDto } from "~/data/types";
import { base64ToBinary, binaryToBase64, encrypt } from "~/util";

type CreatePasteLocalDto = Omit<CreatePasteDto, "content"> & {
  content: string;
  apiKey?: string;
};

export function PasteForm({
  type,
  children,
}: {
  type: PasteDto["type"];
  children: (props: { disabled: Accessor<boolean> }) => JSX.Element;
}) {
  const appUrl = createServerData$(() => process.env.APP_URL);
  const [, save] = createServerAction$(
    async ({ apiKey, ...data }: CreatePasteLocalDto) => {
      if (!process.env.API_KEY || apiKey === process.env.API_KEY) {
        const paste = await createPaste({
          ...data,
          content: base64ToBinary(data.content),
        });
        return new Response(paste.id, { status: 201 });
      } else {
        return new Response("Invalid API key", { status: 401 });
      }
    }
  );

  const [secret, setSecret] = createSignal(false);
  const [id, setId] = createSignal<string | false | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [disabled, setDisabled] = createSignal(false);
  const [copied, setCopied] = createSignal(false);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setId(null);
    try {
      const data = new FormData(
        document.getElementById("create-form") as HTMLFormElement
      );
      setDisabled(true);
      const id = data.get("id") as string;
      const rawContent = data.get("content") as string | File;
      const content =
        typeof rawContent === "string"
          ? new TextEncoder().encode(rawContent)
          : await rawContent.arrayBuffer();
      const deleteCode = data.get("delete_code") as string;
      const payload: CreatePasteLocalDto = {
        id,
        type,
        content: binaryToBase64(content),
        filename: rawContent instanceof File ? rawContent.name : undefined,
        mime: rawContent instanceof File ? rawContent.type : undefined,
        deleteCode,
      };
      const isSecret = !!data.get("secret");

      if (isSecret) {
        const { ciphertext, salt, iv } = await encrypt(
          content,
          data.get("passphrase") as string
        );
        payload.content = binaryToBase64(ciphertext);
        payload.salt = salt;
        payload.iv = iv;
      }

      payload.apiKey = window.localStorage.getItem("api-key") ?? undefined;
      const response = await save(payload);
      if (response?.status === 401) {
        setError("INVALID_API_KEY");
        throw new Error(await response.text());
      } else {
        setId((await response?.text()) ?? id);
      }
    } catch (e) {
      setId(false);
      setDisabled(false);
    }
  };

  return (
    <form
      id="create-form"
      class="mx-auto flex flex-col max-w-7xl gap-4 h-full pt-4 pb-12"
      role="main"
      onSubmit={onSubmit}
    >
      <Switch>
        <Match when={!!id()}>
          <div class="bg-green-600 max-w-3xl w-full mx-auto text-white px-4 py-4 rounded-lg text-center">
            <strong class="text-4xl">Success!</strong>
            <p class="text-xl my-4">Your shared content is now public:</p>
            <input
              id="id"
              name="id"
              class="py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white cursor-pointer w-full text-center"
              value={`${appUrl()}/${id()}`}
              readonly
              onClick={(e) => {
                e.currentTarget.select();
                e.currentTarget.setSelectionRange(0, 99999);
                navigator.clipboard.writeText(e.currentTarget.value);
                setCopied(true);
              }}
            />
            <Show when={copied()}>
              <small>URL copied!</small>
            </Show>
          </div>
        </Match>
        <Match when={!id()}>
          <Show when={id() === false}>
            <div class="bg-red-800 text-white px-4 py-4 rounded-lg">
              <strong class="text-xl">Error</strong>
              <p>
                {error() === "INVALID_API_KEY" ? (
                  <>
                    Your API key is invalid. Please{" "}
                    <A class="underline" href="/auth">
                      check your API key
                    </A>{" "}
                    and try again.
                  </>
                ) : (
                  "An error occurred when trying to share your content. Please check the form and try again."
                )}
              </p>
            </div>
          </Show>
          <div class="flex flex-col gap-2">
            <label for="id" class="font-semibold text-white">
              Slug
            </label>
            <input
              id="id"
              name="id"
              class="py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
              value={nanoid(4)}
              required
              disabled={disabled()}
            />
          </div>
          {children({ disabled })}
          <div class="flex flex-col gap-2">
            <label for="passphrase" class="font-semibold text-white">
              Passphrase
            </label>
            <div class="flex gap-2 sm:gap-6 flex-col justify-center sm:flex-row sm:items-center">
              <input
                id="passphrase"
                name="passphrase"
                class="flex-1 py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={!secret() || disabled()}
                required={secret()}
              />
              <div class="flex gap-3 items-end -mt-1">
                <input
                  class="w-5 h-5"
                  id="secret"
                  name="secret"
                  type="checkbox"
                  onChange={(e) => {
                    const { checked } = e.currentTarget;
                    setSecret(checked);

                    const passphrase = document.getElementById(
                      "passphrase"
                    ) as HTMLInputElement;
                    if (checked && !passphrase.value) {
                      passphrase.value = nanoid(48);
                    } else if (!checked) {
                      passphrase.value = "";
                    }
                  }}
                  disabled={disabled()}
                />
                <label class="flex-1 font-semibold text-white" for="secret">
                  Secret?
                </label>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label for="delete_code" class="font-semibold text-white">
              Delete code
            </label>
            <input
              id="delete_code"
              name="delete_code"
              class="py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
              value={nanoid(5)}
              required
              disabled={disabled()}
            />
          </div>
          <button
            type="submit"
            class="w-full bg-slate-800 hover:bg-slate-900 px-8 py-3 rounded-md text-white font-semibold text-2xl transition-all duration-200 ease-in-out disabled:opacity-70"
            disabled={disabled()}
          >
            Publish
          </button>
        </Match>
      </Switch>
    </form>
  );
}
