import e, { $infer } from "@packages/db/edgeql-js";
import { sign_in } from "@packages/db/interfaces";
import { subscribeToDbListener } from "@/db";
import { coalesce, mergeAsyncIterators } from "@/lib/utils";
import { LocationStatusShape } from "@/lib/utils/queries";
import { pub } from "@/orpc";

export const statuses = pub.route({ method: "GET", path: "/statuses" }).handler(async function* ({ context: { db } }) {
  const getter = async () => {
    return Object.fromEntries(
      (await e.select(e.sign_in.Location, LocationStatusShape).run(db)).map((location) => [location.name, location]),
    ) as { [K in sign_in.LocationName]: $infer<typeof LocationStatusShape>[number] };
  };
  yield await getter();

  // This one covers every location, so there's nothing to filter by name — but it is `pub`, so every
  // visitor holds a stream, and without coalescing each of them refetched on every single event.
  for await (const _ of coalesce(
    mergeAsyncIterators(subscribeToDbListener("sign_in::SignIn"), subscribeToDbListener("sign_in::QueuePlace")),
  )) {
    yield await getter();
  }
});
