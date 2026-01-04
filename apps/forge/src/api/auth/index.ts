import { auth, pub } from "@/orpc";
import * as z from "zod";
import { verifyJWT, handleSignout } from "@/lib/utils/auth";

export const verify = pub
  .route({ method: "GET", path: "/verify" })
  .input(z.object({ token: z.base64url() }))
  .handler(async ({ input: { token } }) => verifyJWT(token));

export const signOut = auth.route({ method: "GET", path: "/sign-out" }).handler(handleSignout);

export const authRouter = pub.prefix("/auth").router({ verify, signOut });
