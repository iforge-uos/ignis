import { auth } from "@/orpc";
import { call } from "@orpc/server";
import * as z from "zod";
import { get } from ".";
import { all } from "./training";
import { signIns as signInsProc } from "./sign-ins";

export const profile = auth
  .route({ method: "GET", path: "/profile" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context }) => {
    const [user, trainings, signIns] = await Promise.all([
      call(get, { id }, { context }),
      call(all, { id }, { context }),
      call(signInsProc, { id }, { context }),
    ]);

    return {
      user,
      trainings,
      signIns,
    };
  });
