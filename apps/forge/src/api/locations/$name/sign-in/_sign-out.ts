// undecided if i need this
import { ldapLibraryToUcardNumber } from "@/lib/utils/sign-in";
import { deskOrAdmin } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { Errors } from "./_flows/_types";
import signOut_ from "./_flows/sign-out";

export const signOut = deskOrAdmin
  .route({ path: "/sign-out/{ucard_number}" })
  .errors(Errors)
  .input(
    z.object({
      name: LocationNameSchema,
      ucard_number: z
        .string()
        .regex(/\d{9,}/)
        .brand("uCardNumber"),
    }),
  )
  .handler(async ({ input: { name, ucard_number }, errors, context }) => {
    return await signOut_({
      $location: e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } }))),
      $user: e.assert_exists(
        e.select(e.users.User, () => ({
          filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
        })),
      ),
      context: { ...context, tx: context.db },
      errors,
    }).next();
  });
