import { ORPCError } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { logger } from "@sentry/bun";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserProfile } from "@/lib/utils/auth";
import client from "@/db";
import ldap from "@/ldap";
import { handleCallback } from "@/lib/utils/auth";
import { removeDomain } from "@/lib/utils/sign-in";

export const Route = createFileRoute("/api/auth/complete")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { success, isSignUp, provider, tokenData } = await handleCallback({
          data: Object.fromEntries(new URLSearchParams(request.url.split("?")[1]).entries()) as any,
        });
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
            const profile = await getUserProfile(tokenData.provider_token!);
            const identity = e.cast(e.ext.auth.Identity, e.uuid(tokenData.identity_id!));
            if (isSignUp) {
              const ldapUser = await ldap.lookupByEmail(profile.email);
              if (!ldapUser) {
                logger.warn("Failed to find a matching email in LDAP", profile as any);
                throw new ORPCError("NOT_FOUND", {
                  message:
                    "Cannot get user info. Please get in contact with us to resolve this it.iforge@sheffield.ac.uk",
                });
              }
              await e.insert(e.users.User, { identity, ...ldap.toInsert(ldapUser) }).run(client);
            } else {
              await e
                .update(e.users.User, () => ({
                  filter_single: { email: removeDomain(profile.email) },
                  set: {
                    identity,
                    profile_picture: profile.picture,
                    first_name: profile.given_name,
                    last_name: profile.family_name,
                  },
                }))
                .run(client);
            }

            throw redirect({
              to: "/auth/login/complete",
              search: {
                registered_now: isSignUp,
              },
            });
          }
        }
      },
    },
  },
});
