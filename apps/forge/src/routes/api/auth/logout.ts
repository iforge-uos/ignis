import { createFileRoute, redirect } from "@tanstack/react-router";
import { handleSignout } from "@/lib/utils/auth";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      ANY: async () => {
        await handleSignout()
        throw redirect({to: "/"})
      },
    },
  },
});
