import { GelAuthError } from "@gel/auth-core";
import e from "@packages/db/edgeql-js";
import * as Sentry from "@sentry/bun";
import { logger } from "@sentry/bun";
import { createFileRoute, redirect } from "@tanstack/react-router";
import client from "@/db";
import ldap, { type LdapUser } from "@/ldap";
import { getUserProfile, handleCallback } from "@/lib/utils/auth";
import { removeDomain } from "@/lib/utils/sign-in";

const SIGN_IN_AGAIN = "That sign in attempt has expired or was already used. Please try again.";
const CONTACT_US = "Cannot get user info. Please get in contact with us to resolve this it.iforge@sheffield.ac.uk";
const DIRECTORY_UNREACHABLE =
  "We can't reach the university directory at the moment, so we can't finish setting up your account. Please try again shortly.";

/**
 * Send the browser back to the login page with something readable instead of letting the failure
 * escape the route handler, where it becomes an unhandled 500 (and a stack trace per attempt in the
 * logs) that the user only experiences as a silent bounce.
 */
function backToLogin(error: string): never {
  throw redirect({ to: "/auth/login", search: { redirect: "/", error }, replace: true });
}

function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause instanceof Error ? ` (caused by ${error.cause.name}: ${error.cause.message})` : "";
  return `${error.name}: ${error.message}${cause}`;
}

/**
 * Run one of the writes this route exists to do, and if it fails say what we were attempting
 * instead of letting it escape as an unhandled 500. These failures used to be invisible: the user
 * ends up with an `ext::auth::Identity` and no profile, which they cannot recover from on their
 * own, so the detail here is the difference between fixing it and guessing.
 */
async function write(what: string, extra: Record<string, unknown>, query: () => Promise<unknown>): Promise<void> {
  try {
    await query();
  } catch (error) {
    logger.error(logger.fmt`Failed to ${what}: ${describe(error)}`);
    Sentry.captureException(error, { tags: { flow: "oauth-complete" }, extra });
    backToLogin(CONTACT_US);
  }
}

/**
 * The OAuth `code` is single use, so a refresh, a back button or a duplicated request replays one
 * we've already spent and Gel rejects it. Equally the provider can just say no. Neither is
 * retryable and neither is our fault.
 */
function isUnusableCallback(error: unknown): boolean {
  if (error instanceof GelAuthError) return true;
  // These errors don't set `name` and the server function boundary can flatten the class, so fall
  // back to the messages Gel and `handleCallback` actually produce.
  return error instanceof Error && /pkce|oauth/i.test(error.message);
}

/**
 * Find the `users::User` this Google account belongs to, if we already have one.
 *
 * `isSignUp` only says whether Gel minted the `ext::auth::Identity` during this round trip, which
 * is a different question: a previous sign up that created the identity and then failed before the
 * user landed, or a desk registration that gave them a placeholder identity, both leave the two
 * disagreeing. Since `new_identity` is true exactly once, trusting it means anyone in that state
 * can never be created - they take the "existing user" branch forever, which updates nothing and
 * bounces them back to the login page. So match on what's actually in the database instead.
 */
async function findByIdentityOrEmail(identityId: string, email: string) {
  const matches = await e
    .select(e.users.User, (user) => ({
      id: true,
      email: true,
      identity: { id: true },
      filter: e.op(e.op(user.identity.id, "=", e.uuid(identityId)), "or", e.op(user.email, "=", e.str(email))),
      limit: 2,
    }))
    .run(client);

  if (matches.length > 1) {
    // One user holds the identity and a different one holds the email. Prefer the identity, since
    // that's what we just authenticated, but say so loudly - an email has moved between accounts.
    logger.warn(
      logger.fmt`Identity ${identityId} and email ${email} belong to different users: ${matches.map((match) => match.id).join(", ")}`,
    );
  }

  return matches.find((match) => match.identity.id === identityId) ?? matches[0] ?? null;
}

/**
 * Last resort before inserting: their email may have changed since we last saw them (reps moving to
 * a PhD get a new one), in which case they're already here under the old address. The ucard number
 * and username survive that, and both are exclusive, so an insert would fail on them anyway.
 */
async function findByLdapIdentifiers(ldapUser: LdapUser) {
  const { username, ucard_number } = ldap.toInsert(ldapUser);

  const matches = await e
    .select(e.users.User, (user) => ({
      id: true,
      email: true,
      filter: e.op(
        e.op(user.username, "=", e.str(username)),
        "or",
        e.op(user.ucard_number, "=", e.int32(ucard_number)),
      ),
      limit: 1,
    }))
    .run(client);

  return matches[0] ?? null;
}

export const Route = createFileRoute("/api/auth/complete")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        let callback: Awaited<ReturnType<typeof handleCallback>>;
        try {
          callback = await handleCallback({
            data: Object.fromEntries(new URLSearchParams(request.url.split("?")[1]).entries()) as any,
          });
        } catch (error) {
          if (!isUnusableCallback(error)) throw error;
          logger.info(logger.fmt`Discarding unusable OAuth callback: ${describe(error)}`);
          backToLogin(SIGN_IN_AGAIN);
        }

        const { success, provider, tokenData } = callback;
        if (!success) {
          throw new Error("Failed to complete callback");
        }

        switch (provider) {
          case "builtin::oauth_apple":
          case "builtin::oauth_azure":
          case "builtin::oauth_discord":
          case "builtin::oauth_github":
          case "builtin::oauth_slack":
            throw new Error("TODO");

          case "builtin::oauth_google": {
            const identityId = tokenData.identity_id!;
            const profile = await getUserProfile(tokenData.provider_token!);
            if (!profile?.email) {
              logger.error(logger.fmt`Google returned no email for identity ${identityId}: ${JSON.stringify(profile)}`);
              backToLogin(CONTACT_US);
            }

            const identity = e.cast(e.ext.auth.Identity, e.uuid(identityId));
            const email = removeDomain(profile.email).toLowerCase();
            const googleFields = {
              identity,
              profile_picture: profile.picture,
              first_name: profile.given_name,
              last_name: profile.family_name,
            };

            const existing = await findByIdentityOrEmail(identityId, email);
            let registered_now = false;

            if (existing) {
              await write(
                `link identity ${identityId} to user ${existing.id} (${existing.email})`,
                { identityId },
                () =>
                  e.update(e.users.User, () => ({ filter_single: { id: existing.id }, set: googleFields })).run(client),
              );
            } else {
              let ldapUser: LdapUser | null;
              try {
                ldapUser = await ldap.lookupByEmail(profile.email);
              } catch (error) {
                // LDAP being unreachable mustn't take the request with it. An error escaping here
                // closes the connection without a response, the browser quietly retries the GET,
                // and the retry replays an OAuth code we've already spent
                logger.error(
                  logger.fmt`LDAP lookup for ${profile.email} (identity ${identityId}) failed, so we cannot create a user: ${describe(error)}`,
                );
                Sentry.captureException(error, {
                  tags: { flow: "oauth-complete" },
                  extra: { identityId, email: profile.email },
                });
                backToLogin(DIRECTORY_UNREACHABLE);
              }

              if (!ldapUser) {
                // They have a university Google account but no LDAP record, so we have no ucard
                // number, username or school to create them with.
                logger.warn(
                  logger.fmt`No LDAP record for ${profile.email} (identity ${identityId}), so there is nothing to create a user from`,
                );
                Sentry.captureMessage("OAuth sign up with no LDAP record", {
                  level: "warning",
                  extra: { identityId, email: profile.email },
                });
                backToLogin(CONTACT_US);
              }

              const renamed = await findByLdapIdentifiers(ldapUser);
              if (renamed) {
                logger.info(
                  logger.fmt`Relinking user ${renamed.id} from ${renamed.email} to ${email} (identity ${identityId}), matched on their ucard number or username`,
                );
                await write(`relink user ${renamed.id} from ${renamed.email} to ${email}`, { identityId }, () =>
                  e
                    .update(e.users.User, () => ({
                      filter_single: { id: renamed.id },
                      set: { ...googleFields, email, organisational_unit: ldapUser.ou },
                    }))
                    .run(client),
                );
              } else {
                const values = ldap.toInsert(ldapUser);
                await write(
                  `create user ${values.username} (email ${values.email}, ucard ${values.ucard_number}, identity ${identityId})`,
                  { identityId, googleEmail: profile.email, ldapUser },
                  () => e.insert(e.users.User, { identity, ...values }).run(client),
                );
                registered_now = true;
                logger.info(logger.fmt`Created user ${values.username} (${values.email}) from identity ${identityId}`);
              }
            }

            throw redirect({
              to: "/auth/login/complete",
              search: {
                registered_now,
              },
            });
          }
        }
      },
    },
  },
});
