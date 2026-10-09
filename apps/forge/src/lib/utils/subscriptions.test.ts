/**
 * The behaviour these pin down is why the registry exists separately from db.ts: a subscriber that
 * stops must be dropped *immediately*, not whenever the next event happens to arrive on its channel.
 * Needs no database or Redis.
 */
import { expect, test } from "bun:test";
import { coalesce, mergeAsyncIterators } from "@/lib/utils";
import { createSubscriptions } from "@/lib/utils/subscriptions";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("delivers to every subscriber of a channel, in order, and to no others", async () => {
  const subs = createSubscriptions<number>();
  const a = subs.subscribe("signins");
  const b = subs.subscribe("signins");
  const other = subs.subscribe("queue");

  subs.dispatch("signins", 1);
  subs.dispatch("queue", 99);
  subs.dispatch("signins", 2);

  expect((await a.next()).value).toBe(1);
  expect((await a.next()).value).toBe(2);
  expect((await b.next()).value).toBe(1);
  expect((await b.next()).value).toBe(2);
  expect((await other.next()).value).toBe(99);
});

test("a stopped subscriber is dropped immediately, without waiting for another event", async () => {
  const subs = createSubscriptions<number>();
  const consumed: number[] = [];
  const consumer = (async () => {
    for await (const value of subs.subscribe("signins")) {
      consumed.push(value);
      break;
    }
  })();

  subs.dispatch("signins", 1);
  await consumer;

  // the whole point: no further event is needed to unwind the subscription
  expect(subs.size).toBe(0);
  expect(consumed).toEqual([1]);
});

test("nothing accumulates for a subscriber that has gone away", async () => {
  const subs = createSubscriptions<number>();
  const iterator = subs.subscribe("signins");
  subs.dispatch("signins", 1);
  await iterator.return?.();

  for (let i = 0; i < 1000; i++) subs.dispatch("signins", i);
  expect(subs.size).toBe(0);
  // the buffered value is released too, and next() stays done rather than replaying it
  expect(await iterator.next()).toEqual({ done: true, value: undefined });
});

test("return() releases a subscriber parked on a quiet channel", async () => {
  const subs = createSubscriptions<number>();
  const iterator = subs.subscribe("signins");

  const pending = iterator.next(); // parks: nothing has been dispatched
  await sleep(20);
  await iterator.return?.();

  // a generator-based subscriber would hang here until an event arrived on the channel
  expect(await pending).toEqual({ done: true, value: undefined });
  expect(subs.size).toBe(0);
});

test("onSubscribe joins the channel before the first value, and its failure surfaces", async () => {
  const joined: string[] = [];
  const subs = createSubscriptions<number>({
    onSubscribe: async (channel) => {
      await sleep(10);
      joined.push(channel);
    },
  });
  const iterator = subs.subscribe("signins");
  subs.dispatch("signins", 1);
  expect((await iterator.next()).value).toBe(1);
  expect(joined).toEqual(["signins"]);

  const failing = createSubscriptions<number>({
    onSubscribe: () => Promise.reject(new Error("redis down")),
  });
  expect(failing.subscribe("signins").next()).rejects.toThrow("redis down");
});

test("composed as the location streams compose it, a disconnect drops both subscriptions", async () => {
  const subs = createSubscriptions<number>();
  let ticks = 0;
  const consumer = (async () => {
    for await (const _ of coalesce(mergeAsyncIterators(subs.subscribe("signins"), subs.subscribe("queue")), 20)) {
      ticks++;
      break; // the client navigates away after the first refetch
    }
  })();

  expect(subs.size).toBe(2);
  subs.dispatch("signins", 1);
  await consumer;
  expect(ticks).toBe(1);

  // Both go immediately, with no further event needed anywhere in the chain
  expect(subs.size).toBe(0);

  // and a later event reaches nobody
  subs.dispatch("queue", 2);
  await sleep(20);
  expect(subs.size).toBe(0);
  expect(ticks).toBe(1);
});
