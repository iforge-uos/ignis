import { createFileRoute } from "@tanstack/react-router";
import { Listenable, publishDbListenable } from "@/db";
import env from "@/lib/env";

export const Route = createFileRoute("/api/db/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("Authorization") === env.db.globals.PUB_SUB_SECRET) {
          const listenable = Listenable.parse(await request.json());
          await publishDbListenable(listenable);
          return Response.json({ success: true }, { status: 200 });
        }
        return Response.json({ success: false }, { status: 401 });
      },
    },
  },
});
