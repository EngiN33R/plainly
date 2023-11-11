// @refresh reload
import { Suspense } from "solid-js";
import {
  useLocation,
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";

export default function Root() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-slate-400"
      : "border-transparent hover:border-slate-400";
  return (
    <Html lang="en">
      <Head>
        <Title>Plainly</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="bg-slate-700">
        <Suspense>
          <ErrorBoundary>
            <nav class="bg-slate-800 h-14">
              <ul class="w-full flex items-center justify-center p-3 text-gray-200 h-full gap-12">
                <li class={`border-b-2 ${active("/")}`}>
                  <A href="/">Home</A>
                </li>
                <li class={`border-b-2 ${active("/text")}`}>
                  <A href="/text">Pastebin</A>
                </li>
                <li class={`border-b-2 ${active("/link")}`}>
                  <A href="/link">Links</A>
                </li>
                {/* <li class={`border-b-2 ${active("/file")}`}>
                  <A href="/link">Files</A>
                </li> */}
              </ul>
            </nav>
            <main class="main">
              <Routes>
                <FileRoutes />
              </Routes>
            </main>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
