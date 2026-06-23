import e from "@packages/db/edgeql-js";
import * as z from "zod";
import env from "@/lib/env";
import { queueErrors } from "@/lib/printers/utils";
import { printing } from "@/orpc";

export const get = printing
  .errors(queueErrors)
  .route({ method: "GET", path: "/{id}" })
  .input(z.object({ id: z.uuid().describe("The PrintHistory UUID") }))
  .output(z.file())
  .handler(async ({ input: { id }, context: { db }, errors }) => {
    const history = await e
      .select(e.printing.PrintHistory, (h) => ({
        has_timelapse: true,
        print: e.assert_exists(e.assert_single(e.select(h["<on[is printing::Print]"], () => ({ name: true })))),
        filter_single: { id: e.uuid(id) },
      }))
      .run(db);
    if (!history?.has_timelapse) throw errors.FILE_NOT_FOUND({ data: { id, file_type: "timelapse" } });

    let response: Response;
    try {
      response = await fetch(`${env.cdn.url}/timelapse/${id}.mpg`);
    } catch {
      throw errors.DOWNLOAD_FAILED();
    }
    if (response.status === 404) throw errors.FILE_NOT_FOUND({ data: { id, file_type: "timelapse" } });
    if (!response.ok) throw errors.DOWNLOAD_FAILED();

    const blob = await response.blob();
    return new File([blob], `${history.print.name}.mpg`, { type: blob.type || "video/mpeg" });
  });
