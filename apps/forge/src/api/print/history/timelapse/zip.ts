import { datetimeSchema } from "@packages/db/zod/modules/std";
import jwt from "jsonwebtoken";
import * as z from "zod";
import env from "@/lib/env";
import { queueErrors, timelapsesInPeriod } from "@/lib/printers/utils";
import { printing } from "@/orpc";

export const zip = printing
  .errors(queueErrors)
  .route({ method: "GET", path: "/zip" })
  .input(z.object({ start: datetimeSchema, end: datetimeSchema.optional() }))
  .output(z.file())
  .handler(async ({ input: { start, end }, context: { db, user }, errors }) => {
    const ids = await timelapsesInPeriod(db, start, end);
    if (ids.length === 0) throw errors.NOT_FOUND();

    const access_token = jwt.sign({ sub: user.id, roles: user.roles.map((r) => r.id) }, env.auth.jwtSecret!, {
      expiresIn: "5m",
    });

    let response: Response;
    try {
      response = await fetch(`${env.cdn.url}/zip/timelapse`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, access_token }),
      });
    } catch {
      throw errors.DOWNLOAD_FAILED();
    }
    if (!response.ok) throw errors.DOWNLOAD_FAILED();

    const blob = await response.blob();
    return new File([blob], "timelapses.zip", { type: blob.type || "application/zip" });
  });
