import { admin } from "@/orpc";
import { logger } from "@sentry/tanstackstart-react";
import { UUID } from "gel/dist/reflection/queries";
import z from "zod";

const ORIGINAL_USERS: { [K: UUID]: UUID } = {};

export const su = admin
  .route({ path: "/su" })
  .input(z.object({ user_id: z.uuid() }))
  .handler(async ({ context: { user, res }, input: { user_id } }) => {
    logger.debug(logger.fmt`Substitute user identity for ${user.id} -> ${user_id}`);

    res.setHeaders(new Headers({ foo: "" }));
  });
