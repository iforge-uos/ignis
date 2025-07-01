import { onUserInsert } from "@/db";
import ldap from "@/ldap";
import { ORPCError } from "@orpc/server";
import e, { type $infer } from "@packages/db/edgeql-js";
import { LocationName } from "@packages/types/sign_in";
import { Infraction } from "@packages/types/users";
import { logger } from "@sentry/node";
import { Executor } from "gel";
import { exhaustiveGuard } from ".";
import type { SignInUserShape } from "./queries";

/**
 * Strip the domain from a Sheffield email address
 *
 * @param email - The email address to strip the domain from
 * @returns The email address without the domain
 *
 */
export function removeDomain(email: string): string {
  return email.slice(0, email.length - "@sheffield.ac.uk".length);
}

/**
 * Returns the uCard number from the Library Number
 *
 * @remarks
 * We discard the first 3 characters of the Library Number as they are the issue index (i.e. the amount of times the card has been reissued (in most cases 001))
 *
 * @param shefLibraryNumber - The string representation of the Library Number to parse
 * @returns The parsed number as a Number type.
 *
 */
export function ldapLibraryToUcardNumber(shefLibraryNumber: string): number {
  return Number.parseInt(shefLibraryNumber.slice(3));
}

export function formatInfractions(infractions: Infraction[]) {
  const infractionErrors = [];
  for (const infraction of infractions) {
    switch (infraction.type) {
      case "PERM_BAN":
        infractionErrors.push(`User is permanently banned from the iForge. Reason: ${infraction.reason}`);
        break;
      case "TEMP_BAN":
        infractionErrors.push(
          `User is banned from the iForge for ${infraction.duration}. Reason: ${infraction.reason}`,
        );
        break;
      case "WARNING":
        infractionErrors.push(`User has an unresolved warning. Reason: ${infraction.reason}`);
        break;
      case "RESTRICTION":
        infractionErrors.push(`User has an unresolved restriction. Reason: ${infraction.reason}`);
        break;
      case "TRAINING_ISSUE":
        infractionErrors.push(`User has an unresolved training issue. Reason: ${infraction.reason}`);
        break;
      default:
        exhaustiveGuard(infraction.type);
    }
  }
  return infractionErrors;
}

export type SignInUser = $infer<typeof SignInUserShape>[number] & {
  signed_in: boolean;
  first_time: boolean;
  registered: boolean;
  location?: string | null;
};

export const getSignInUser = async ({
  tx,
  ucard_number,
}: { tx: Executor; ucard_number: string }): Promise<SignInUser | null> => {
  const sign_in = e.select(e.sign_in.SignIn, (sign_in) => ({
    filter_single: e.op(
      e.op(sign_in.user.ucard_number, "=", ldapLibraryToUcardNumber(ucard_number)),
      "and",
      e.op("not", sign_in.signed_out),
    ),
  }));
  const user_by_ucard = e.select(e.users.User, () => ({
    filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
  }));

  return await e
    .select(e.op(sign_in.user, "??", user_by_ucard), (user) => ({
      ...SignInUserShape(user),
      registered: e.bool(true),
      signed_in: e.op("exists", sign_in),
      location: sign_in.location.name,
    }))
    .run(tx);
};

/**
 * Get the user from the DB or from LDAP. Always returns and has extra sign in related properties for display on the frontend
 */
export const ensureUser = async ({
  tx,
  ucard_number,
  name,
}: { tx: Executor; ucard_number: string; name: LocationName }): Promise<SignInUser> => {
  const user = await getSignInUser({ tx, ucard_number });
  if (user) return user;
  logger.info(logger.fmt`Registering user: ${ucard_number} at location: ${name}`);

  // no user registered, fetch from ldap
  const ldap_user = await ldap.lookupByUcardNumber(ucard_number);
  if (!ldap_user) {
    throw new ORPCError("NOT_FOUND", {
      message: `User with UCard Number ${ucard_number} couldn't be found. Perhaps you made a typo? (it should look like 001739897)`,
    });
  }

  const user_by_email = e.select(e.users.User, () => ({
    filter_single: { email: ldap_user.mail },
  }));
  const u = await user_by_email.run(tx);

  const new_user = await e
    .select(
      e.insert(e.sign_in.UserRegistration, {
        location: e.select(e.sign_in.Location, () => ({
          filter_single: { name },
        })),
        // TODO there's a better way incoming but this works for now.
        // check https://discord.com/channels/841451783728529451/1309279819359584397
        // Ideally looks like user: e.insert(e.users.User, ...).unlessConflict(
        // (user) => ({
        //   on: user.email,
        //   else: e.update(user, () => ({
        //     set: ...
        //   })),
        // }),
        // )
        user: u
          ? e.update(e.assert_exists(user_by_email), () => ({
              set: {
                ucard_number: ldapLibraryToUcardNumber(ucard_number),
                username: ldap_user.uid,
                organisational_unit: ldap_user.ou,
              },
            }))
          : e.insert(e.users.User, {
              ...ldap.toInsert(ldap_user),
              identity: e.insert(e.ext.auth.Identity, { issuer: "ignis", subject: "", modified_at: new Date() }),
            }),
      }).user,
      (user) => ({
        ...SignInUserShape(user),
        signed_in: e.bool(false),
        first_time: e.bool(true),
        registered: e.bool(true),
      }),
    )
    .run(tx);

  if (!u) {
    await onUserInsert(new_user);
  }

  return new_user;
};
