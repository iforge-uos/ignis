import { printing } from "@/orpc";
import { queueErrors } from "@/lib/printers/utils";
import * as z from "zod";
import e from "@packages/db/edgeql-js";
import { print_status_FailureReasonSchema } from "@packages/db/zod/modules/printing";

const printStatusEnum = z.enum(["QUEUED", "UNDER_REVIEW", "CANCELLED", "FAILED"]);

export const status = printing
  .errors(queueErrors)
  .route({ method: "PATCH", path: "/status" })
  .input(
    z.object({
      id: z.uuid(),
      status: printStatusEnum,
      reason: print_status_FailureReasonSchema.optional(),
      message: z.string().min(1).optional(),
    }),
  )
  .output(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id, status, reason, message }, context: { db }, errors }) => {
    const print = await e
      .select(e.printing.Print, (p) => ({
        history: e.assert_single(
          e.select(p.on, (h) => ({
            id: true,
            status_name: h.status.__type__.name,
          })),
        ),
        filter_single: { id: e.uuid(id) },
      }))
      .run(db);
    if (!print?.history) throw errors.PRINT_JOB_NOT_FOUND({ data: { id } });
    if (print.history.status_name === "printing::print_status::Printing") throw errors.PRINT_STARTED();
    const history_id = print.history.id;

    const new_status = (() => {
      switch (status) {
        case "QUEUED":
          return e.insert(e.printing.print_status.Queued, {});
        case "UNDER_REVIEW":
          return e.insert(e.printing.print_status.UnderReview, {});
        case "CANCELLED":
          return e.insert(e.printing.print_status.Cancelled, {});
        case "FAILED":
          if (!reason) throw errors.INPUT_VALIDATION_FAILED();
          return e.insert(e.printing.print_status.Failed, { reason, note: message });
      }
    })();

    await e
      .update(e.printing.PrintHistory, () => ({
        filter_single: { id: e.uuid(history_id) },
        set: { status: new_status },
      }))
      .run(db);

    return { id };
  });
