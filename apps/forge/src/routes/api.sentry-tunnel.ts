import { createServerFileRoute } from "@tanstack/react-start/server";

const SENTRY_HOST = "o4507082090414080.ingest.de.sentry.io";
const SENTRY_PROJECT_IDS = ["4508127275122768"];

export const ServerRoute = createServerFileRoute("/api/sentry-tunnel").methods({
  POST: async ({ request }) => {
    try {
      const envelope = await request.text();

      const pieces = envelope.split("\n");
      if (pieces.length < 2) {
        return new Response("Invalid envelope", { status: 400 });
      }

      const header = JSON.parse(pieces[0]);

      // Extract project ID from DSN or header
      const projectId = header.dsn ? new URL(header.dsn).pathname.split("/").pop() : null;

      // Validate project ID for security
      if (!projectId) {
        return new Response("Missing project ID", { status: 400 });
      }

      if (!SENTRY_PROJECT_IDS.includes(projectId)) {
        return new Response("Invalid project", { status: 400 });
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
