import type { ConvexQueryClient } from "@convex-dev/react-query";
import { Toaster } from "@sourdough/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConvexProvider } from "convex/react";

import Header from "../components/header";

import appCss from "../index.css?url";

export interface RouterAppContext {
  convexQueryClient: ConvexQueryClient;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootDocument,

  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        // eslint-disable-next-line unicorn/text-encoding-identifier-case -- HTML meta charset must be "utf-8"
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "My App",
      },
    ],
  }),
});

function RootDocument() {
  const { convexQueryClient } = Route.useRouteContext();

  return (
    <ConvexProvider client={convexQueryClient.convexClient}>
      <html className="dark" lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            <Outlet />
          </div>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
          <Scripts />
        </body>
      </html>
    </ConvexProvider>
  );
}
