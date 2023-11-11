import { JSX } from "solid-js";
import { A, Navigate } from "solid-start";

const Box = ({ href, children }: { href: string; children: JSX.Element }) => (
  <A
    href={href}
    class="shadow-md border-2 bg-slate-800 bg-opacity-50 border-slate-700 border-opacity-50 rounded-lg flex flex-1 justify-center py-8 font-semibold text-white text-4xl cursor-pointer hover:bg-opacity-70 transition-all duration-300 ease-in-out"
  >
    {children}
  </A>
);

export default function Default() {
  return (
    <>
      <section class="py-8 max-w-xl mx-auto flex flex-col items-center">
        <h1 class="text-center text-7xl font-semibold text-white">
          Plainly
          <small class="block font-normal text-2xl mt-4">
            Basic sharing done right
          </small>
        </h1>
        <p class="mt-12 text-center text-white">
          <strong>Plainly</strong>'s goal is to make sharing basic content with
          your people extremely easy, while at the same time keeping data
          ownership entirely with <em>you</em>, the author. Here's a quick
          pitch:
        </p>
        <ul class="mt-8 text-center text-white flex flex-col gap-1">
          <li>It's simple to set up on your own architecture</li>
          <li>It's lightweight, performant, and responsive</li>
          <li>It's secure by design, offering end-to-end encryption</li>
          <li>It's available to use as a Web interface and a REST API</li>
          <li>It's completely free (both as in beer and as in freedom)</li>
        </ul>
        <p class="mt-8 text-center text-white">What would you like to share?</p>

        <nav class="mt-4 flex justify-between w-full gap-4">
          <Box href="/text">Text</Box>
          <Box href="/text">Link</Box>
          {/* <Box href="/text">File</Box> */}
        </nav>
      </section>
    </>
  );
}
