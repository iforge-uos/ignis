import { auth } from "@/orpc";
import { startTraining } from "@packages/db/queries/startTraining.query";
import { z } from "zod/v4";

export const start = auth
  .route({ path: "/start" })
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .handler(async ({ input: { id }, context: { db } }) => startTraining(db, { id }));
