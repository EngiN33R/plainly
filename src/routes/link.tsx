import { PasteForm } from "~/components/PasteForm";

export default function Link() {
  return (
    <PasteForm type="link">
      {({ disabled }) => (
        <div class="flex flex-col gap-2">
          <label for="content" class="font-semibold text-white">
            Target
          </label>
          <input
            id="content"
            name="content"
            required
            class="py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
            disabled={disabled()}
          />
        </div>
      )}
    </PasteForm>
  );
}
