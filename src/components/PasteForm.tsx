import { nanoid } from "nanoid";
import { Accessor, JSX, Match, Show, Switch, createSignal } from "solid-js";
import { A } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { createPaste } from "~/data/paste";
import { CreatePasteDto, PasteDto } from "~/data/types";
import { encrypt } from "~/util";

export function PasteForm({
  type,
  children,
}: {
  type: PasteDto["type"];
  children: (props: { disabled: Accessor<boolean> }) => JSX.Element;
}) {
  const [, save] = createServerAction$(async (data: CreatePasteDto) => {
    await createPaste(data);
  });

  const [secret, setSecret] = createSignal(false);
  const [id, setId] = createSignal<string | false | null>(null);
  const [disabled, setDisabled] = createSignal(false);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setId(null);
    try {
      const data = new FormData(
        document.getElementById("create-form") as HTMLFormElement
      );
      setDisabled(true);
      console.log(data);
      const id = data.get("id") as string;
      const content = data.get("content") as string;
      const payload: CreatePasteDto = { id, type, content };
      const isSecret = !!data.get("secret");

      if (isSecret) {
        const { ciphertext, salt, iv } = await encrypt(
          content,
          data.get("passphrase") as string
        );
        payload.content = ciphertext;
        payload.salt = salt;
        payload.iv = iv;
      }

      await save(payload);
      setId(id);
    } catch (e) {
      setId(false);
      setDisabled(false);
    }
  };

  return (
    <form
      id="create-form"
      class="mx-auto flex flex-col max-w-7xl gap-4 h-full pt-4 pb-12"
      onSubmit={onSubmit}
    >
      <Switch>
        <Match when={!!id()}>
          <div class="bg-green-600 text-white px-4 py-4 rounded-lg text-center">
            <strong class="text-4xl">Success!</strong>
            <p class="text-xl mt-4">
              Your shared content is available at{" "}
              <A class="underline" href={`/${id()}`}>
                plainly.engi.io/{id()}
              </A>
              .
            </p>
          </div>
        </Match>
        <Match when={!id()}>
          <Show when={id() === false}>
            <div class="bg-red-800 text-white px-4 py-4 rounded-lg">
              <strong class="text-xl">Error</strong>
              <p>
                An error occurred when trying to share your content. Please
                check the form and try again.
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
            <div class="flex gap-6 items-center">
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
                    }
                  }}
                  disabled={disabled()}
                />
                <label class="font-semibold text-white" for="secret">
                  Secret?
                </label>
              </div>
            </div>
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
