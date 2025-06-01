import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";
import type { orpc } from "@/utils/orpc";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "../components/header";
import appCss from "../index.css?url";
import React from "react";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  user: ReturnType<typeof useUser>
}

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "iForge",
      },
      {
        name: "description",
        content:
          "The University of Sheffield's iForge is the UK's first student-led makerspace. We believe in learning through making.",
      },
      {
        name: "author",
        content: "iForge Team",
      },
      {
        name: "keywords",
        content:
          "iForge, makerspace, innovation, making, collaboration, Sheffield University",
      },
      {
        property: "og:title",
        content: "iForge - learning through making",
      },
      {
        property: "og:description",
        content:
          "The University of Sheffield's iForge is the UK's first student-led makerspace. We believe in learning through making.",
      },
      {
        property: "og:image",
        content: "https://iforge.sheffield.ac.uk/cdn/logos/iforge.png",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://iforge.sheffield.ac.uk",
      },
      {
        property: "og:site_name",
        content: "iForge",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "iForge - learning through making",
      },
      {
        name: "twitter:description",
        content:
          "The University of Sheffield's iForge is the UK's first student-led makerspace. We believe in learning through making.",
      },
      {
        name: "twitter:image",
        content: "https://iforge.sheffield.ac.uk/cdn/logos/iforge.png",
      },
      {
        name: "twitter:site",
        content: "@iForgeUOS",
      },
      {
        name: "twitter:creator",
        content: "@iForgeUOS",
      },
      {
        name: "robots",
        content: "index, follow",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.svg",
      },
    ],
  }),

  component: RootDocument,
});

declare global {
  interface Date {
    toTemporalInstant(): Temporal.Instant;
  }
}

Date.prototype.toTemporalInstant = toTemporalInstant;

Sentry.init({
  dsn: "https://893631a88ccccc18a9b65d8b5c3e1395@o4507082090414080.ingest.de.sentry.io/4508127275122768",
  integrations: [Sentry.browserTracingIntegration()],
  // @ts-ignore its find and replaced
  tracesSampleRate: '%MODE%' === "development" ? 1.0 : 0.1,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/api.iforge.sheffield.ac.uk/],
  sendDefaultPii: false,
});


function RootDocument() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="grid h-svh grid-rows-[auto_1fr]">
          {isFetching ? <Loader /> : <Outlet />}
        </div>
        <Toaster richColors theme={useTheme().normalisedTheme}/>
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />

        <Scripts />
        <script>
          {document.addEventListener("DOMContentLoaded", () => {
            function setFavicon() {
              const link = document.createElement("link");
              const oldLink = document.getElementById("dynamic-favicon");
              link.id = "dynamic-favicon";
              link.rel = "icon";
              link.href = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "/favicon-dark.svg"
                : "/favicon.svg";
              if (oldLink) {
                document.head.removeChild(oldLink);
              }
              document.head.appendChild(link);
            }

            setFavicon();
            window
              .matchMedia("(prefers-color-scheme: dark)")
              .addEventListener("change", setFavicon);
          }) ?? null}
        </script>
      </body>
    </html>
  );
}
