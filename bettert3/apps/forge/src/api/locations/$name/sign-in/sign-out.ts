import { deskOrAdmin } from "@/orpc";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { z } from "zod/v4";
import signOut_ from "./_flows/sign-out";
import { ldapLibraryToUcardNumber } from "@/lib/utils/sign-in";
import { SignInErrors } from "./_flows/_types";

export const signOut = deskOrAdmin
  .route({ path: "/sign-out/{ucard_number}" })
  .errors(SignInErrors)
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
      $location: e.select(e.sign_in.Location, () => ({ filter_single: { name } })),
      $user: e.select(e.users.User, () => ({
        filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
      })),
      context: { ...context, tx: context.db },
      errors,
    }).next()
  });
