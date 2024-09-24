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
import { createServerData$ } from "solid-start/server";

const NavItem = ({ href, children }: { href: string; children: string }) => {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-slate-400"
      : "border-transparent hover:border-slate-400";

  return (
    <A
      href={href}
      class={`border-b-4 flex-1 flex items-center justify-center cursor-pointer h-full ${active(
        href
      )}`}
    >
      {children}
    </A>
  );
};

export default function Root() {
  const authEnabled = createServerData$(() => !!process.env.API_KEY);

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
            <div class="bg-slate-800 relative">
              <nav class="h-14 w-full max-w-7xl mx-auto flex justify-center text-gray-200">
                <NavItem href="/text">Text</NavItem>
                <NavItem href="/link">Link</NavItem>
                <NavItem href="/file">File</NavItem>
              </nav>
              {authEnabled() && (
                <A
                  class="absolute right-0 top-0 bottom-0 flex items-center px-4 text-gray-200"
                  href="/auth"
                >
                  🔐
                </A>
              )}
            </div>
            <div class="main px-3 xl:px-0">
              <Routes>
                <FileRoutes />
              </Routes>
            </div>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
