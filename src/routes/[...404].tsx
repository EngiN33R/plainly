import { A } from "solid-start";

export default function NotFound() {
  return (
    <main
      id="not-found"
      class="py-8 max-w-xl mx-auto flex flex-col items-center"
    >
      <h1 class="text-center text-5xl font-semibold uppercase text-white">
        Not found
      </h1>
      <p class="mt-8 text-center text-white">
        We couldn't find this resource. Looks like you may have gotten a broken
        URL.
      </p>
      <p class="mt-4 text-center text-white">
        If you got a link from a friend, make sure they gave you the right one.
      </p>
      <p class="mt-4 text-center text-white">
        Why not{" "}
        <A href="/" class="underline">
          go back and share something new?
        </A>
      </p>
    </main>
  );
}
