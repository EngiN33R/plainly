export default function Auth() {
  const onSubmit = async (e: Event) => {
    e.preventDefault();
    const data = new FormData(
      document.getElementById("auth-form") as HTMLFormElement
    );
    window.localStorage.setItem(
      "api-key",
      (data.get("api_key") as string) ?? ""
    );
    window.location.href = "/";
  };

  return (
    <form
      id="auth-form"
      class="mx-auto flex flex-col max-w-7xl gap-4 h-full pt-4 pb-12"
      role="main"
      onSubmit={onSubmit}
    >
      <label for="api_key" class="font-semibold text-white text-xl">
        API key
      </label>
      <input
        id="api_key"
        name="api_key"
        class="py-2 px-3 rounded-md bg-slate-800 bg-opacity-50 text-white"
        value={localStorage.getItem("api-key") ?? ""}
        type="password"
        required
      />
      <button
        type="submit"
        class="w-full bg-slate-800 hover:bg-slate-900 px-8 py-3 rounded-md text-white font-semibold text-2xl transition-all duration-200 ease-in-out disabled:opacity-70"
      >
        Save
      </button>
    </form>
  );
}
