import env from "@/lib/env";
import jwt from "jsonwebtoken";

export default function verifyJWT(token: string) {
  return jwt.verify(token, env.auth.jwtSecret, { ignoreExpiration: false });
}
