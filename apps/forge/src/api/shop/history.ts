import { CardNotFound, DuplicateUserName } from "@iforge-uos/pharos-edi-client";
import { ErrorMap } from "@orpc/server";
import z from "zod";
import { deskOrAdmin } from "@/orpc";
import e from "@packages/db/edgeql-js"

export const history = deskOrAdmin
  .route({ path: "/history" })
  .input()
  .handler(async ({ input: { username }, errors }) => {
    return e.select(e.shop.Purchase)
  });
