import { auth } from "@/router";
import { startTraining } from "@dbschema/queries/startTraining.query";
import { z } from "zod";

export const start = auth
  .route({ path: "/start" })
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .handler(async ({ input: { id }, context: { db } }) => startTraining(db, { id }));
