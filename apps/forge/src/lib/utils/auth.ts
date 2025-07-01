import { config } from "@/lib/env/server";
import jwt from "jsonwebtoken";

export default function verifyJWT(token: string) {
  return jwt.verify(token, config.auth.jwtSecret, { ignoreExpiration: false });
}
