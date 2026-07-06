import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { PrintJob } from "@/lib/printers/types";
import { filamentMatches, queueErrors, toFilamentSlots } from "@/lib/printers/utils";
import { printing } from "@/orpc";
import { printers, printManager } from "@/printing";
import { PartialUserShape } from "@/lib/utils/queries";
import email from "@/email";

export const send = printing
  .errors(queueErrors)
  .route({ method: "POST", path: "/send" })
  .input(z.object({ id: z.uuid(), printer: z.string().min(1) }))
  .output(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id, printer }, context: { db }, errors }) => {
    const record = printers.get(printer);
    if (!record) throw errors.PRINTER_NOT_FOUND({ data: { name: printer } });
    if (!printManager.Printers.includes(printer)) throw errors.PRINTER_DISCONNECTED();

    const state = await printManager.getStatus(printer);
    if (state.state === "disconnected") throw errors.PRINTER_DISCONNECTED();
    if (state.state === "disabled") throw errors.PRINTER_DISABLED();

    const print = await e
      .select(e.printing.Print, (p) => ({
        id: true,
        name: true,
        gcode_path: true,
        filament: true,
        duration: true,
        author: PartialUserShape,
        history: e.assert_single(
          e.select(p.history, (h) => ({
            id: true,
            queue: true,
            status_name: h.status.__type__.name,
            has_timelapse: true,
          })),
        ),
        filter_single: { id: e.uuid(id) },
      }))
      .run(db);
    if (!print?.history) throw errors.PRINT_JOB_NOT_FOUND({ data: { id } });
    switch (print.history.status_name) {
      case "printing::print_status::UnderReview":
        throw errors.PRINT_UNDER_REVIEW();
      case "printing::print_status::Printing":
        throw errors.PRINT_STARTED();
      case "printing::print_status::Cancelled":
      case "printing::print_status::Failed":
        throw errors.PRINT_CANCELLED_OR_FAILED();
      case "printing::print_status::Complete":
      case "printing::print_status::Queued":
        break;
      default:
        throw errors.INPUT_VALIDATION_FAILED();
    }
    const history_id = print.history.id;

    if (print.filament.length <= 1) {
      const printer_row = await e
        .select(e.printing.Printer, () => ({ filament: true, filter_single: { id: record.id } }))
        .run(db);
      const matches = !!printer_row && filamentMatches(print.filament, printer_row.filament);
      if (!matches) throw errors.PRINTER_FILAMENT_MISMATCH({ data: { name: printer } });
    }

    const job: PrintJob = {
      job_id: "0",
      uuid: print.id,
      name: print.name,
      gcode_url: print.gcode_path,
      filament: toFilamentSlots(print.filament),
      queue: print.history.queue,
    };

    try {
      await printManager.sendJob(printer, job, print.history.has_timelapse);
    } catch {
      throw errors.COMMAND_FAILED();
    }

    await e
      .update(e.printing.PrintHistory, () => ({
        filter_single: { id: e.uuid(history_id) },
        set: {
          printer: e.select(e.printing.Printer, () => ({ filter_single: { id: record.id } })),
          status: e.insert(e.printing.print_status.Printing, {
            print: e.assert_exists(e.select(e.printing.Print, () => ({ filter_single: { id: e.uuid(id) } }))),
          }),
        },
      }))
      .run(db);

    const printer_location = await e
      .assert_exists(
        e.select(e.printing.Printer, () => ({
          location: { name: true },
          filter_single: { id: record.id },
        })),
      )
      .run(db);

    await email.sendPrintSendEmail(print.author, {
      sent_at: new Date(),
      print_name: print.name,
      print_time: print.duration,
      printer,
      location: printer_location.location.name,
    });

    return { id };
  });
