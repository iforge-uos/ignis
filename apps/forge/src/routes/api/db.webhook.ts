import { captureMessage, logger } from "@sentry/tanstackstart-react";
import { createFileRoute } from "@tanstack/react-router";
import { Listenable, publishDbListenable } from "@/db";
import env from "@/lib/env";

export const Route = createFileRoute("/api/db/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("Authorization") === env.db.globals.PUB_SUB_SECRET) {
          const listenable = Listenable.parse(await request.json());
          logger.info(`DB webhook reached; ${listenable.type} ${listenable.action}`);
          await publishDbListenable(listenable);
          return Response.json({ success: true }, { status: 200 });
        }
        // A mismatch here means the DB's PUB_SUB_SECRET global and our env have drifted apart, so every
        // DB change notification is being dropped — raise an issue rather than just a log line.
        captureMessage("DB webhook rejected: invalid PUB_SUB_SECRET", {
          level: "error",
          extra: { authorizationHeaderPresent: request.headers.has("Authorization") },
        });
        return Response.json({ success: false }, { status: 401 });
      },
    },
  },
});
