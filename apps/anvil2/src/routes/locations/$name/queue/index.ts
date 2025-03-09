// @IdempotencyCache(60)
import email from "@/email";
import { pub } from "@/router";
import { QueuePlaceShape } from "@/utils/queries";
import { ensureUser } from "@/utils/sign-in";
import { ldapLibraryToUcardNumber } from "@/utils/signin.utils";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e, { $infer } from "@dbschema/edgeql-js";
import { TRPCError } from "@trpc/server";
import { AccessError, ConstraintViolationError } from "gel";
import { z } from "zod";
import { remove } from "./$id";
import auth from "@/auth";

export const addInPerson = pub
  .route({
    method: "POST",
    path: "/{ucard_number}",
  })
  .input(
    z.object({
      location: LocationNameSchema,
      ucard_number: z.string().regex(/\d{9,}/),
    }),
  )
  .use()
  .handler(async ({ input: { location, ucard_number }, context: { db, logger } }) => {
    logger.info(`Adding UCard number: ${ucard_number} to queue in-person at location: ${location}`);

    let place: $infer<typeof QueuePlaceShape>[number];
    try {
      place = await e
        .select(
          e.insert(e.sign_in.QueuePlace, {
            user: e.assert_exists(
              e.select(e.users.User, () => ({
                filter_single: {
                  ucard_number: ldapLibraryToUcardNumber(ucard_number),
                },
              })),
            ),
            location: e.select(e.sign_in.Location, () => ({
              filter_single: { name: location },
            })),
          }),
          QueuePlaceShape,
        )
        .run(db);
    } catch (error: any) {
      if (error instanceof AccessError) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          cause: error,
          message: error.message,
        });
      }
      if (error instanceof ConstraintViolationError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: error,
          message: "The user is already in the queue",
        });
      }

      logger.error(`Error adding user ${ucard_number} to queue at ${location}: ${error.message}`);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add user to queue",
      });
    }

    await email.sendQueuedEmail(place, location);

    logger.debug(`Sent queued email to user ${place.user.display_name} (${place.user.ucard_number})`);

    return place;
  });

export const queueRouter = pub.prefix("/").router({
  // add
  addInPerson, // TODO after sign in refactor to only have sign in have like 1 button (Scan card) make this call
  remove,
});
