import e, { $infer } from "@packages/db/edgeql-js";
import { sign_in } from "@packages/db/interfaces";
import { subscribeToDbListener } from "@/db";
import { mergeAsyncIterators } from "@/lib/utils";
import { LocationStatusShape } from "@/lib/utils/queries";
import { pub } from "@/orpc";

export const statuses = pub.route({ method: "GET", path: "/statuses" }).handler(async function* ({ context: { db } }) {
  const getter = async () => {
    return Object.fromEntries(
      (await e.select(e.sign_in.Location, LocationStatusShape).run(db)).map((location) => [location.name, location]),
    ) as { [K in sign_in.LocationName]: $infer<typeof LocationStatusShape>[number] }
  }
  yield await getter()

  for await (const _ of mergeAsyncIterators(
    subscribeToDbListener("sign_in::SignIn"),
    subscribeToDbListener("sign_in::QueuePlace"),
  )) {
    yield await getter()
  }
});
