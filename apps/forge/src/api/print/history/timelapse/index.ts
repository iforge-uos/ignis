import { datetimeSchema } from "@packages/db/zod/modules/std";
import * as z from "zod";
import { timelapsesInPeriod } from "@/lib/printers/utils";
import { auth, printing } from "@/orpc";
import { get } from "./$id";
import { zip } from "./zip";

export const list = printing
  .route({ method: "GET", path: "/" })
  .input(z.object({ start: datetimeSchema, end: datetimeSchema.optional() }))
  .output(z.array(z.uuid()))
  .handler(({ input: { start, end }, context: { db } }) => timelapsesInPeriod(db, start, end));

export const timelapseRouter = auth.prefix("/timelapse").router({
  list,
  get,
  zip,
});
