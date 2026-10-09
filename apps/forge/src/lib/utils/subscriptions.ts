/**
 * The channel registry behind {@link subscribeToDbListener} in db.ts, kept separate from it so it can
 * be tested without Redis or the env schema.
 *
 * The subscribers are deliberately hand-written async iterators rather than generators. A generator
 * parked on an `await` cannot be unwound: calling `return()` on it only queues the return until that
 * await settles, so a subscriber waiting on a quiet channel would stay registered — and keep
 * accumulating dispatched values — until something happened to arrive on it. Here `return()` runs
 * immediately, dropping the subscriber and releasing anything it had buffered.
 */

type Handler<T> = {
  channel: string;
  queue: T[];
  wake: (() => void) | null;
  done: boolean;
};

export type Subscriptions<T> = {
  /** How many subscribers are registered, so a leak shows up as a number worth logging. */
  readonly size: number;
  /** Hand `value` to every subscriber of `channel`. */
  dispatch(channel: string, value: T): void;
  subscribe(channel: string): AsyncIterableIterator<T>;
};

export function createSubscriptions<T>({
  onSubscribe,
}: {
  /** Called on each subscribe, for the transport to join the channel. Awaited before the first value. */
  onSubscribe?: (channel: string) => unknown;
} = {}): Subscriptions<T> {
  const handlers = new Set<Handler<T>>();

  const wake = (handler: Handler<T>) => {
    const resolve = handler.wake;
    handler.wake = null;
    resolve?.();
  };

  return {
    get size() {
      return handlers.size;
    },

    dispatch(channel, value) {
      for (const handler of handlers) {
        if (handler.channel === channel) {
          handler.queue.push(value);
          wake(handler);
        }
      }
    },

    subscribe(channel) {
      const handler: Handler<T> = { channel, queue: [], wake: null, done: false };
      handlers.add(handler);

      const ready = Promise.resolve(onSubscribe?.(channel));
      // next() surfaces the failure; this only stops it being an unhandled rejection meanwhile
      void ready.catch(() => {});

      const close = () => {
        handler.done = true;
        handlers.delete(handler);
        handler.queue.length = 0;
        wake(handler);
      };

      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        async next(): Promise<IteratorResult<T>> {
          await ready;
          while (!handler.done) {
            if (handler.queue.length) return { done: false, value: handler.queue.shift()! };
            await new Promise<void>((resolve) => {
              handler.wake = resolve;
            });
          }
          return { done: true, value: undefined };
        },
        async return(): Promise<IteratorResult<T>> {
          close();
          return { done: true, value: undefined };
        },
        async throw(error?: unknown): Promise<IteratorResult<T>> {
          close();
          throw error;
        },
      };
    },
  };
}
