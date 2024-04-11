import { edgedb } from "@dbschema/edgeql-js/imports";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import e from "@dbschema/edgeql-js";

@Processor("cleanup")
export class CleanupProcessor {
  constructor(private readonly db: edgedb.Client) {}

  @Process("removeExpiredTokens")
  async handleRemoveExpiredTokens(job: Job) {
    const currentDate = new Date();
    await e
      .delete(e.auth.BlacklistedToken, (token) => ({
        filter: e.op(token.expires, ">", currentDate),
      }))
      .run(this.db);
  }
}
