import createExpressAuth from "@gel/auth-express";
import { PartialUser } from "@packages/types/users";
import { createClient } from "gel";
import config from "@/lib/env/server";
import email from "@/api/email";

const client = createClient().withConfig({ apply_access_policies: false });

export const auth = createExpressAuth(client, {
  baseUrl: "http://127.0.0.1:3000",
  // authCookieName: "",
});

// listeners

export async function onUserInsert(user: PartialUser) {
  // await email.sendWelcomeEmail(user);
}

export async function onSignInInsert() {}
export async function onSignInUpdate() {}

export default client;
