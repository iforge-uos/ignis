import auth from "@/auth";
// @IdempotencyCache(60)
import email from "@/email";
import { pub } from "@/router";
import { QueuePlaceShape } from "@/utils/queries";
import { ensureUser } from "@/utils/sign-in";
import { ldapLibraryToUcardNumber } from "@/utils/sign-in";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import e, { $infer } from "@dbschema/edgeql-js";
import { AccessError, ConstraintViolationError } from "gel";
import { z } from "zod";
import { remove } from "./$id";
import Logger from "@/utils/logger";

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
  .handler(async ({ input: { location, ucard_number }, context: { db }, errors }) => {
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
        throw errors.QUEUE_DISABLED({
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

      throw error;
    }

    await email.sendQueuedEmail(place, location);

    Logger.debug(`Sent queued email to user ${place.user.display_name} (${place.user.ucard_number})`);

    return place;
  });

export const queueRouter = pub.prefix("/").router({
  // add
  addInPerson, // TODO after sign in refactor to only have sign in have like 1 button (Scan card) make this call
  remove,
});
