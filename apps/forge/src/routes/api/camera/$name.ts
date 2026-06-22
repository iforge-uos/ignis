import { createFileRoute } from "@tanstack/react-router";
import { withSession } from "@/lib/utils/auth";
import { createContext } from "@/orpc";
import { printManager, setupPrinters } from "@/printing";

const webcamUrl = (ip: string, action: "stream" | "snapshot") => `http://${ip}/webcam/?action=${action}`;

export const Route = createFileRoute("/api/camera/$name")({
  server: {
    middleware: [withSession],
    handlers: {
      GET: async ({ request, params, context }) => {
        const { user } = await createContext(context);
        if (!user) return new Response("Unauthorized", { status: 401 });

        await setupPrinters();

        let ip: string;
        let hasCamera: boolean;
        try {
          const config = printManager.getConfig(params.name);
          if (!config) return new Response("Printer not found", { status: 404 });
          ip = config.ip;
          hasCamera = config.has_camera;
        } catch {
          return new Response("Printer not found", { status: 404 });
        }

        if (!hasCamera) return new Response("Printer has no camera", { status: 404 });

        const action = new URL(request.url).searchParams.has("snapshot") ? "snapshot" : "stream";

        let upstream: Response;
        try {
          upstream = await fetch(webcamUrl(ip, action), { signal: request.signal });
        } catch {
          return new Response("Camera unavailable", { status: 502 });
        }

        if (!(upstream.ok && upstream.body)) return new Response("Camera unavailable", { status: 502 });

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "multipart/x-mixed-replace",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
