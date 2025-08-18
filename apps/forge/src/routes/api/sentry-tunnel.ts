import { createServerFileRoute } from "@tanstack/react-start/server";

const SENTRY_HOST = "o4507082090414080.ingest.de.sentry.io";
const SENTRY_PROJECT_IDS = ["4508127275122768"];

export const ServerRoute = createServerFileRoute("/api/sentry-tunnel").methods({
  POST: async ({ request }) => {
    return
    try {
      const envelope = await request.text();

      const pieces = envelope.split("\n");
      if (pieces.length < 2) {
        return new Response("Invalid envelope", { status: 400 });
      }

      const header = JSON.parse(pieces[0]);

      // Extract DSN and validate
      if (!header.dsn) {
        return new Response("Missing DSN", { status: 400 });
      }

      const dsn = new URL(header.dsn);
      const projectId = dsn.pathname.split("/").pop();

      // Validate hostname for security
      if (dsn.hostname !== SENTRY_HOST) {
        return new Response("Invalid Sentry hostname", { status: 400 });
      }

      // Validate project ID for security
      if (!projectId) {
        return new Response("Missing project ID", { status: 400 });
      }

      if (!SENTRY_PROJECT_IDS.includes(projectId)) {
        return new Response("Invalid project ID", { status: 400 });
      }

      // Forward to Sentry
      const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;

      const sentryResponse = await fetch(sentryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-sentry-envelope",
        },
        body: envelope,
      });

      return new Response(null, {
        status: sentryResponse.status,
        statusText: sentryResponse.statusText,
      });
    } catch (error) {
      console.error("Sentry tunnel error:", error);
      return new Response("Internal server error", { status: 500 });
    }
  },
});
