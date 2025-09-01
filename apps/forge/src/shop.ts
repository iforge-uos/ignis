import { PharosClient } from "@iforge-uos/pharos-edi-client";
import env from "@/lib/env";

let client: PharosClient;
try {
  // Create the client with a 3 second timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Pharos client creation timed out after 3s')), 3000)
  );

  const clientPromise = PharosClient.create(`${env.pharos.url}?wsdl`, env.pharos.auth);

  client = await Promise.race([clientPromise, timeoutPromise]) as PharosClient;
} catch (error) {
  console.error("Failed to setup the Pharos client, shop API will not work")
  // @ts-ignore
  client = {};
}
export default client;

