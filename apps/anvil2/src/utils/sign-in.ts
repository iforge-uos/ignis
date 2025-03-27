import { onUserInsert } from "@/db";
import ldap from "@/ldap";
import e, { type $infer } from "@dbschema/edgeql-js";
import { LocationName, User } from "@ignis/types/sign_in";
import { ORPCError } from "@orpc/server";
import { Executor } from "gel";
import { Context } from "..";
import Logger from "./logger";
import { InfractionShape, UserShape } from "./queries";

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

export const REP_ON_SHIFT = "Rep On Shift";
export const REP_OFF_SHIFT = "Rep Off Shift";
export const PERSONAL = "Personal";

const SignInUserShape = e.shape(e.users.User, (user) => ({
  ...UserShape(user),
  infractions: InfractionShape(user.infractions),
  is_rep: e.op(user.__type__.name, "=", "users::Rep"),
  first_time: e.op(e.count(user.sign_ins), ">", 0),
  ...e.is(e.users.Rep, {
    teams: { name: true, description: true, id: true },
  }),
}));

export type SignInUser = $infer<typeof SignInUserShape>[number] & {
  signed_in: boolean;
  first_time: boolean;
  registered: boolean;
  location?: string | null;
};

export const getSignInUser = async ({
  db,
  ucard_number,
}: { db: Executor; ucard_number: string }): Promise<SignInUser | null> => {
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
    .run(db);
};

/**
 * A transformer for Zod objects for oRPC to get a user object in the sign in function's body.
 */
export const ensureUser = async ({
  db,
  ucard_number,
  name,
}: { db: Executor; ucard_number: string; name: LocationName }): Promise<SignInUser> => {
  const user = await getSignInUser({ db, ucard_number });
  if (user) return user;
  Logger.info(`Registering user: ${ucard_number} at location: ${name}`);

  // no user registered, fetch from ldap
  const ldap_user = await ldap.lookupByUcardNumber(ucard_number);
  if (!ldap_user) {
    throw new ORPCError("NOT_FOUND", {
      message: `User with ucard no ${ucard_number} couldn't be found. Perhaps you made a typo? (it should look like 001739897)`,
    });
  }

  const user_by_email = e.select(e.users.User, () => ({
    filter_single: { email: ldap_user.mail },
  }));
  const u = await user_by_email.run(db);

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
    .run(db);

  if (!u) {
    await onUserInsert(new_user);
  }

  return new_user;
};
