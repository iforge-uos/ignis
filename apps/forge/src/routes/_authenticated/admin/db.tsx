import { useSidebar } from "@packages/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";

function Component() {
  const authToken = Route.useLoaderData();
  const { setOpen, setOpenMobile } = useSidebar();

  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  useEffect(() => {
    // auto-collapse the sidebar
    setOpen(false);
    setOpenMobile(false);
  }, [setOpen, setOpenMobile]);

  return (
      <iframe
        title="iForge Database UI"
        src={isLocalhost ? `http://localhost:10705/ui?authToken=${authToken}` : `https://db.iforge.sheffield.ac.uk/ui?authToken=${authToken}`}
        className="w-full h-full border-0"
        referrerPolicy="no-referrer"
      />
  );
}

export const Route = createFileRoute("/_authenticated/admin/db")({
  component: Component,
  loader: async ({ context }) => await ensureQueryData(
    context.queryClient,
    orpc.admin.getGelUI.queryOptions(),
  ),
});
