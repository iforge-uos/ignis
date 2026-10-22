import { createPrivateKey, type KeyObject, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { ORPCError } from "@orpc/server";
import { logger } from "@sentry/tanstackstart-react";
import jwt from "jsonwebtoken";
import env from "@/lib/env";
import { admin } from "@/orpc";

// The Gel admin UI authenticates via a JWT signed with the server's own JWS key
// (the `edbjwskeys.pem` in its data dir). `gel ui --print-url` can only mint this
// for CLI-managed instances, not the Dockerised server we run, so we sign it
// ourselves. Token format is from gel-jwt (src/gel.rs): an "edbt1_" prefix in front
// of a compact JWS, with scope claims edb.r (roles) / edb.i (instances) / edb.d
// (databases), each accepting an ".all" wildcard form.
const TOKEN_PREFIX = "edbt1_";

let signingKey: KeyObject | undefined;
async function getSigningKey(): Promise<KeyObject> {
  if (!signingKey) {
    if (!env.db.ui.keyFile) throw new Error("GEL_JWS_KEY_FILE is not set");
    const pem = await readFile(env.db.ui.keyFile, "utf8");
    // The file may hold multiple PEM blocks; the first private key is the signer.
    const block = pem.match(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g)?.find((b) => {
      try {
        createPrivateKey(b);
        return true;
      } catch {
        return false;
      }
    });
    if (!block) throw new Error("no private key found in Gel JWS key file");
    const key = createPrivateKey(block);
    // Gel generates a P-256 key (ES256); jsonwebtoken can't sign the EdDSA it may also accept
    if (key.asymmetricKeyDetails?.namedCurve !== "prime256v1") throw new Error("Gel JWS key is not P-256");
    signingKey = key;
  }
  return signingKey;
}

export const getGelUI = admin.route({ path: "/db/ui" }).handler(async () => {
  logger.info("Minting Gel UI token");

  let key: KeyObject;
  try {
    key = await getSigningKey();
  } catch (error) {
    logger.error("Failed to load Gel JWS signing key", { error });
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Gel UI signing key is unavailable" });
  }

  const token =
    TOKEN_PREFIX +
    jwt.sign(
      {
        iss: "gel",
        sub: "edgedb",
        jti: randomUUID(),
        "edb.r.all": true,
        "edb.i.all": true,
        "edb.d.all": true,
      },
      key,
      { algorithm: "ES256", expiresIn: "1h" },
    );

  return `${env.db.ui.url}/ui?authToken=${token}`;
});
