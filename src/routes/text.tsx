import { PasteForm } from "~/components/PasteForm";

export default function Pastebin() {
  return (
    <PasteForm type="text">
      {({ disabled }) => (
        <div class="flex flex-1 flex-col gap-2">
          <label for="content" class="font-semibold text-white">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            class="flex-1 py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
            required
            disabled={disabled()}
          />
        </div>
      )}
    </PasteForm>
  );
}
