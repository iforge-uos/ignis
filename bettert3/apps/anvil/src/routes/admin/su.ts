import { admin } from "@/router";
import { logger } from "@sentry/bun";
import z from "zod/v4";

export const su = admin
  .route({ path: "/su" })
  .input(z.object({ user_id: z.uuid() }))
  .handler(async ({ context: {user, res}, input: { user_id } }) => {
    logger.debug(logger.fmt`Substitute user identity for ${user.id} -> ${user_id}`);

    res.setHeaders(new Headers({foo: ""}))
  });
