import config from "@/config";
import { verify } from "jsonwebtoken";

export default function verifyJWT(token: string) {
  return verify(token, config.auth.jwtSecret, { ignoreExpiration: false });
}
