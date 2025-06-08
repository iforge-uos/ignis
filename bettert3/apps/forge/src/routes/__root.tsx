import { AppSidebar } from "@/components/app-navigation";
import { SidebarHeader } from "@/components/app-navigation/sidebar-header";
import CommandMenu from "@/components/command-menu";
import { TailwindIndicator } from "@/components/dev/Tailwind-Indicator";
import { Footer } from "@/components/footer";
import UCardReader from "@/components/ucard-reader";
import { useTheme } from "@/hooks/useTheme";
import type { useUser } from "@/hooks/useUser";
import type { orpc } from "@/lib/orpc";
import Loader from "@packages/ui/components/loader";
import { Toaster } from "@packages/ui/components/sonner";
import Sentry, { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import React, { Suspense } from "react";
import appCss from "../index.css?url";
import { SidebarInset } from "@packages/ui/components/sidebar";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  user: ReturnType<typeof useUser>;
}

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = wrapCreateRootRouteWithSentry(createRootRouteWithContext<RouterAppContext>)()({
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
        content: "iForge, makerspace, innovation, making, collaboration, Sheffield University",
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


function RootDocument() {
  // const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <React.StrictMode>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <CommandMenu />
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <div className="sticky top-0 z-50 bg-background">
              <SidebarHeader />
            </div>
            <div className="flex-grow">
              <Outlet />
              <TailwindIndicator />
              <UCardReader />

              <Toaster richColors theme={useTheme().normalisedTheme} />
              <Suspense>
                <TanStackRouterDevtools position="bottom-left" />
              </Suspense>
              <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
              <Footer />
            </div>
          </SidebarInset>
          <Scripts />
          <script>
            {document.addEventListener("DOMContentLoaded", () => {
              function setFavicon() {
                const link = document.createElement("link");
                const oldLink = document.getElementById("dynamic-favicon");
                link.id = "dynamic-favicon";
                link.rel = "icon";
                link.href = window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "/favicon-dark.svg"
                  : "/favicon.svg";
                if (oldLink) {
                  document.head.removeChild(oldLink);
                }
                document.head.appendChild(link);
              }

              setFavicon();
              window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setFavicon);
            }) ?? null}
          </script>
        </body>
      </html>
    </React.StrictMode>
  );
}
