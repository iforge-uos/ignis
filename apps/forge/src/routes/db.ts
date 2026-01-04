import { createFileRoute } from "@tanstack/react-router";
import env from "@/lib/env";
import { DB_LISTENERS, Listenable } from "@/db";

export const Route = createFileRoute("/db")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("Authorization") === env.db.globals.PUB_SUB_SECRET) {
          const listenable = Listenable.parse(await request.json());
          DB_LISTENERS.publish(`${listenable.type}$${listenable.action}`, listenable);
        }
      },
    },
  },
});
