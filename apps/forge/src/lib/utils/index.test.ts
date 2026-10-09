/**
 * Unit tests for the async-iterator helpers behind the location streams. Unlike the other tests in
 * this directory these need no database.
 */
import { expect, test } from "bun:test";
import { coalesce, filterAsyncIterator, mergeAsyncIterators } from "@/lib/utils";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A pushable async iterable that records whether its consumer closed it. */
function channel<T>() {
  const queue: T[] = [];
  let wake: (() => void) | null = null;
  let closed = false;
  let returned = false;

  const wakeUp = () => {
    const resolve = wake;
    wake = null;
    resolve?.();
  };

  const iterable: AsyncIterable<T> = {
    [Symbol.asyncIterator]: () => ({
      async next() {
        while (true) {
          if (queue.length) return { done: false as const, value: queue.shift()! };
          if (closed) return { done: true as const, value: undefined as never };
          await new Promise<void>((resolve) => {
            wake = resolve;
          });
        }
      },
      async return() {
        returned = true;
        return { done: true as const, value: undefined as never };
      },
    }),
  };

  return {
    iterable,
    push: (value: T) => {
      queue.push(value);
      wakeUp();
    },
    close: () => {
      closed = true;
      wakeUp();
    },
    wasReturned: () => returned,
  };
}

test("a burst of events produces a single tick", async () => {
  const source = channel<number>();
  let ticks = 0;
  const consumer = (async () => {
    for await (const _ of coalesce(source.iterable, 50)) ticks++;
  })();

  for (let i = 0; i < 20; i++) source.push(i);
  await sleep(200);
  // without coalescing every connected client ran the full refetch for each of these
  expect(ticks).toBe(1);

  source.close();
  await consumer;
});

test("the delay is a trailing edge, not a leading one", async () => {
  const source = channel<number>();
  let ticks = 0;
  const consumer = (async () => {
    for await (const _ of coalesce(source.iterable, 200)) ticks++;
  })();

  source.push(1);
  await sleep(80);
  // a leading edge would have fired already, doing the work before the rest of the burst landed
  expect(ticks).toBe(0);
  await sleep(300);
  expect(ticks).toBe(1);

  source.close();
  await consumer;
});

test("events arriving during handling collapse into one follow-up tick", async () => {
  const source = channel<number>();
  const ticks: number[] = [];
  const consumer = (async () => {
    for await (const _ of coalesce(source.iterable, 20)) {
      ticks.push(Date.now());
      // stand in for a slow refetch, with events landing while we are busy
      for (let i = 0; i < 10; i++) source.push(i);
      await sleep(100);
    }
  })();

  source.push(0);
  await sleep(400);
  // one tick per round, not one per event — otherwise the stream can never catch up once behind
  expect(ticks.length).toBeLessThanOrEqual(4);
  expect(ticks.length).toBeGreaterThanOrEqual(2);

  source.close();
  await consumer;
});

test("coalesce closes its source when the consumer stops", async () => {
  const source = channel<number>();
  const consumer = (async () => {
    for await (const _ of coalesce(source.iterable, 10)) break;
  })();
  source.push(1);
  await consumer;
  expect(source.wasReturned()).toBe(true);
});

test("coalesce terminates when the source ends", async () => {
  const source = channel<number>();
  let ticks = 0;
  const consumer = (async () => {
    for await (const _ of coalesce(source.iterable, 10)) ticks++;
  })();
  source.push(1);
  await sleep(50);
  source.close();
  await consumer; // must not hang
  expect(ticks).toBe(1);
});

test("filterAsyncIterator keeps matching values and closes its source", async () => {
  const source = channel<{ location?: string }>();
  const seen: unknown[] = [];
  const consumer = (async () => {
    for await (const event of filterAsyncIterator(
      source.iterable,
      (e) => e.location === undefined || e.location === "MAINSPACE",
    )) {
      seen.push(event.location);
      if (seen.length === 2) break;
    }
  })();

  source.push({ location: "HEARTSPACE" });
  source.push({ location: "MAINSPACE" });
  // unlabelled events are deletes, whose row is already gone, so they have to pass through or
  // sign-outs and queue departures stop reaching the other location's subscribers
  source.push({ location: undefined });
  await consumer;
  expect(seen).toEqual(["MAINSPACE", undefined]);
  expect(source.wasReturned()).toBe(true);
});

test("merged sources coalesce into one tick per burst, as the location streams compose them", async () => {
  const signIns = channel<number>();
  const queue = channel<number>();
  let ticks = 0;
  const consumer = (async () => {
    for await (const _ of coalesce(mergeAsyncIterators(signIns.iterable, queue.iterable), 50)) ticks++;
  })();

  for (let i = 0; i < 5; i++) {
    signIns.push(i);
    queue.push(i);
  }
  await sleep(200);
  expect(ticks).toBe(1);

  signIns.close();
  queue.close();
  await consumer;
});

test("a stopped consumer of a merged stream does no further work", async () => {
  const signIns = channel<number>();
  const queue = channel<number>();
  let ticks = 0;
  const consumer = (async () => {
    for await (const _ of coalesce(mergeAsyncIterators(signIns.iterable, queue.iterable), 10)) {
      ticks++;
      break;
    }
  })();

  signIns.push(1);
  await consumer; // must not hang: see the note on cleanup in coalesce
  expect(ticks).toBe(1);

  // Both sources are closed, promptly, and nothing more is driven after the consumer leaves
  expect(signIns.wasReturned()).toBe(true);
  expect(queue.wasReturned()).toBe(true);

  signIns.push(2);
  queue.push(3);
  await sleep(100);
  expect(ticks).toBe(1);
}, 5000);
