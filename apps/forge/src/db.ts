import email from "@/api/email";
import config from "@/lib/env/server";
import createExpressAuth from "@gel/auth-express";
import { EventPublisher } from "@orpc/client";
import { PartialUser } from "@packages/types/users";
import { createClient } from "gel";

const client = createClient().withConfig({ apply_access_policies: false });

export const auth = createExpressAuth(client, {
  baseUrl: "http://127.0.0.1:3000",
  // authCookieName: "",
});

// listeners

export async function onUserInsert(user: PartialUser) {
  // await email.sendWelcomeEmail(user);
}

interface DBListeners {
  "signIn:insert": {};
  "sign_in::SignIn::insert": {};
  signIn: {};
  // user:
}

export const DB_LISTENERS = new EventPublisher<DBListeners>();

export async function onSignInInsert() {
  DB_LISTENERS.publish("signIn:insert", {});
  DB_LISTENERS.publish("signIn", {});
}
export async function onSignInUpdate() {}

export default client;
