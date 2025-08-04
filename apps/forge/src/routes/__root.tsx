import { AppSidebar } from "@/components/app-navigation";
import { SidebarHeader } from "@/components/app-navigation/sidebar-header";
import { ClientHintCheck } from "@/components/client-hint-check";
import CommandMenu from "@/components/command-menu";
import { TailwindIndicator } from "@/components/dev/Tailwind-Indicator";
import { Footer } from "@/components/footer";
import UCardReader from "@/components/ucard-reader";
import { themeQueryKey, useTheme } from "@/hooks/useTheme";
import type { useUser } from "@/hooks/useUser";
import type { orpc } from "@/lib/orpc";
import { getRequestInfo } from "@/lib/request-info";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import { Toaster } from "@packages/ui/components/sonner";
import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsInProd } from "@tanstack/react-router-devtools";
import appCss from "../index.css?url";

export interface RouterAppContext {
  queryClient: QueryClient;
  user: ReturnType<typeof useUser>;
}

const RootDocument = () => {
  const theme = useTheme();
  return (
    <html lang="en" className={theme}>
      <head>
        <ClientHintCheck />
        <HeadContent />
      </head>
      <body>
        <CommandMenu />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <div className="sticky top-0 z-50 bg-background border-b">
              <SidebarHeader />
            </div>
            <div className="flex-grow overflow-auto">
              <Outlet />
              <TailwindIndicator />
              <UCardReader />

              <Toaster richColors theme={theme} />
              <TanStackRouterDevtoolsInProd position="bottom-right" />
              <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
              <Footer />
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Scripts />
      </body>
    </html>
  );
};

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
  loader: async ({ context }) => {
    const requestInfo = await getRequestInfo();

    context.queryClient.setQueryData(themeQueryKey, requestInfo.userPreferences.theme);

    return { requestInfo };
  },
  component: RootDocument,
});
