import createExpressAuth from "@gel/auth-express";
import { PartialUser } from "@ignis/types/users";
import { createClient } from "gel";
import config from "./config";
import email from "./email";

const client = createClient();

export const auth = createExpressAuth(client, {
  baseUrl: config.frontend.url,
  // authCookieName: "",
});

// listeners

export async function onUserInsert(user: PartialUser) {
  await email.sendWelcomeEmail(user);
}

export async function onSignInInsert() {}
export async function onSignInUpdate() {}

export default client;
