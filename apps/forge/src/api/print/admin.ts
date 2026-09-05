import { threeDP } from "@/orpc";
import * as z from "zod";
import env from "@/lib/env";

export const admin = threeDP
  .route({ method: "POST", path: "/admin", description: "3DP Admin auth for _3dpadminonly route" })
  .input(z.object({ password: z.string().min(1) }))
  .output(z.object({ ok: z.boolean() }))
  .handler(async ({ input: { password } }) => ({ ok: password === env.printing.threeDpAdminPassword }));
