import { onUserInsert } from "@/edgedb";
import ldap from "@/ldap";
import { Context } from "@/router";
import e from "@dbschema/edgeql-js";
import { users } from "@ignis/types";
import { LocationName, User } from "@ignis/types/sign_in";
import { TRPCError } from "@trpc/server";
import logger from "./logger";
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

/**
 * A transformer for Zod objects for tRPC to get a user object in the sign in function's body.
 */
export async function ensureUser<T extends { ucard_number: string; name: LocationName }>({
  input: { ucard_number, name, ...rest },
  ctx,
}: { input: T; context: { db: Context["db"] } }) {
  const sign_in = e.select(e.sign_in.SignIn, (sign_in) => ({
    filter_single: e.op(
      e.op(sign_in.user.ucard_number, "=", ldapLibraryToUcardNumber(ucard_number)),
      "and",
      e.op("not", sign_in.signed_out),
    ),
  }));

  let user: (User & { location?: LocationName }) | null = await e
    .select(sign_in.user, (user) => ({
      ...UserShape(user),
      infractions: InfractionShape(user.infractions),
      is_rep: e.op(user.__type__.name, "=", "users::Rep"),
      registered: e.bool(true),
      signed_in: e.bool(true),
      location: sign_in.location.name,
      ...e.is(e.users.Rep, {
        teams: { name: true, description: true, id: true },
      }),
    }))
    .run(ctx.db);

  if (user) {
    return { user, name, ...rest };
  }
  user = await e
    .select(e.users.User, (user) => ({
      filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
      ...UserShape(user),
      infractions: InfractionShape(user.infractions),
      is_rep: e.op(user.__type__.name, "=", "users::Rep"),
      registered: e.bool(true),
      signed_in: e.bool(false),
      ...e.is(e.users.Rep, {
        teams: { name: true, description: true, id: true },
      }),
    }))
    .run(ctx.db);
  if (user) {
    return { user, name, ...rest };
  }

  logger.info(`Registering user: ${ucard_number} at location: ${name}`);

  // no user registered, fetch from ldap
  const ldapUser = await ldap.lookupByUcardNumber(ucard_number);
  if (!ldapUser) {
    throw new TRPCError({
      message: `User with ucard no ${ucard_number} couldn't be found. Perhaps you made a typo? (it should look like 001739897)`,
      code: "NOT_FOUND",
    });
  }

  const ldapUserShape = { ...ldap.toInsert(ldapUser), is_rep: e.bool(false), registered: e.bool(false) };
  const userByEmail = e.select(e.users.User, () => ({
    filter_single: { email: ldapUserShape.email },
  }));
  const u = await userByEmail.run(ctx.db);

  // TODO there's a better way incoming but this works for now.
  // check https://discord.com/channels/841451783728529451/1309279819359584397
  const upsert = (userQuery: any) => {
    return e.select(
      e.insert(e.sign_in.UserRegistration, {
        location: e.select(e.sign_in.Location, () => ({
          filter_single: { name: name },
        })),
        user: e.assert_exists(userQuery),
      }).user,
      (user) => ({
        ...UserShape(user),
        infractions: InfractionShape(user.infractions),
        signed_in: e.bool(false),
      }),
    );
  };

  user = await upsert(
    u
      ? e.update(e.assert_exists(userByEmail), () => ({
          set: {
            ucard_number: ldapLibraryToUcardNumber(ucard_number),
            username: ldapUser.uid,
            organisational_unit: ldapUser.ou,
            is_rep: e.op(userByEmail.__type__.name, "=", "users::Rep"),
            registered: e.bool(true),
          },
        }))
      : e.insert(e.users.User, ldapUserShape),
  ).run(ctx.db);
  if (!user) throw new Error("unreachable");

  if (!u) {
    await onUserInsert(user);
  }

  return { user, name, ...rest };
}
