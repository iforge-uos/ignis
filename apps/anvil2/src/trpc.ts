import { EdgeDBService } from "@/services/edgedb.service";
import e from "@dbschema/edgeql-js";
import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import createClient, { Client, EdgeQLSyntaxError } from "edgedb";
import express from "express";
export const UserProps = e.shape(e.users.User, () => ({
  // TODO use double splat when it's available edgedb/edgedb-js#558
  ...e.users.User["*"],
  agreements_signed: {
    id: true,
    created_at: true,
    "@created_at": true,
    version: true,
  },
  referrals: true,
  roles: { id: true, name: true },
  permissions: true,
  mailing_list_subscriptions: true,
}));
const RepProps = e.shape(e.users.Rep, (rep) => ({
  ...UserProps(rep),
  status: true,
  teams: { id: true, name: true },
}));
// created for each request
const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  user: await EdgeDBService.query(
    e.select(e.users.Rep, (rep) => ({ ...RepProps(rep), filter_single: { ucard_number: 786768 } })),
  ),
  db: EdgeDBService.instance.client,
});
type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const { router } = t;
export const publicProcedure = t.procedure;
export const deskProcedure = t.procedure.use(async ({ next, ctx: { user, ...props } }) => {
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" });
  }

  if (!user?.roles.some((r) => r.name === "Desk")) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not able to use this method based on your roles" });
  }
  return next({
    ctx: { user, ...props },
  });
});
