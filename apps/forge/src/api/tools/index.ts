import e from "@packages/db/edgeql-js";
import { ToolShape } from "@/lib/utils/queries";
import { pub } from "@/orpc";
// import { get } from "./$id";

export const all = pub.handler(async ({ context: { db } }) => await e.select(e.tools.Tool, ToolShape).run(db));

export const toolsRouter = pub.prefix("/tools").router({ all });
