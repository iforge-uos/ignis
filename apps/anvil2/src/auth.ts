// TODO stuff for idocs

import e from "@dbschema/edgeql-js";
import { CallbackRequest } from "@gel/auth-express";
import { ORPCError } from "@orpc/server";
import axios from "axios";
import { Response } from "express";
import { auth, onUserInsert } from "./db";
import ldap from "./ldap";
import { PartialUserShape } from "./utils/queries";

interface GoogleUser {
  family_name: string;
  sub: string;
  picture: string;
  email_verified: boolean;
  given_name: string;
  email: string;
  name: string;
}

export async function getUserProfile(providerToken: any): Promise<GoogleUser> {
  const { data } = await axios.get(" https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${providerToken}`,
      Accept: "application/json",
    },
  });
  return data;
}

export default auth.createOAuthRouter("/auth/oauth", {
  callback: [
    async (req: CallbackRequest, _: Response) => {
      const profile = await getUserProfile(req.tokenData?.provider_token);
      if (req.isSignUp) {
        const ldapUser = await ldap.lookupByEmail(profile.email);
        if (!ldapUser) {
          throw new ORPCError("NOT_FOUND", {
            message: "Cannot get user info. Please get in contact with us to resolve this it.iforge@sheffield.ac.uk",
          });
        }
        const user = await e
          .select(
            e.insert(e.users.User, {
              identity: e.assert_exists(
                e.select(e.ext.auth.Identity, () => ({
                  filter_single: { id: req.tokenData!.identity_id },
                })),
              ),
              ...ldap.toInsert(ldapUser),
            }),

            (user) => ({
              ...PartialUserShape(user),
              registered: e.bool(false),
            }),
          )
          .run(req.session!.client);
        await onUserInsert(user);
        return { registered: false };
      }
    },
  ],
});
