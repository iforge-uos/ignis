import { auth, pub, rep } from "@/router";
import e from "@db/edgeql-js";
import { getTrainingForEditing } from "@db/queries/getTrainingForEditing.query";
import { z } from "zod";
import { start } from "./start";

export const get = auth
  .route({ path: "/{id}" })
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .handler(async ({ input: { id }, context: { db } }) => {
    await e
      .assert_exists(
        e.select(e.training.Training, () => ({
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          description: true,
          locations: true,
          compulsory: true,
          in_person: true,
          enabled: true,
          rep: {
            id: true,
            name: true,
            description: true,
          },
          icon_url: true,
          filter_single: { id },
        })),
      )
      .run(db);
  });

export const getForEditing = rep
  .route({ path: "/{id}/edit" })
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .handler(
    async ({ input: { id }, context: { db } }) =>
      // TODO if rep is empty validate the user has the actually put in schema
      await getTrainingForEditing(db, { id }),
  );

export const idRouter = pub.prefix("/{id}").router({
  get,
  getForEditing,
  start,
});
