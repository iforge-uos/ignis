import { verify } from "jsonwebtoken";

export default function verifyJWT(token: string) {
  return verify(token, process.env.JWT_SECRET!, { ignoreExpiration: false });
}
