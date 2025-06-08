import { pub } from "@/router";

export const healthz = pub.route({ method: "GET", path: "/healthz" }).handler(async () => ({ status: "ok" }));

export const deployRouter = pub.prefix("/").router({ healthz });
