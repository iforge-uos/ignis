import { UCARD_LENGTH } from "../constants";

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  });
}

export function removeSuffix(str: string, suffix: string) {
  if (str.endsWith(suffix)) {
    return str.slice(0, -suffix.length);
  }
  return str;
}

export function removePrefix(str: string, prefix: string) {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  }
  return str;
}

export function uCardNumberToString(ucard_number: number): string {
  return ucard_number.toString().padStart(UCARD_LENGTH, "0");
}

export function exhaustiveGuard(_value: never): never {
  throw new Error(`ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}

interface Reduceable<T> {
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
}

export function counter<T extends string | number | symbol>(iter: Reduceable<T>) {
  return iter.reduce(
    (acc, current) => {
      acc[current] = (acc[current] || 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

const pr = new Intl.PluralRules("en-GB", { type: "ordinal" });

const suffixes = new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"],
]);
export const formatOrdinals = (n: number) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};

export const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m));
export const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m));

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export async function sleep(durationMillis: number) {
  return new Promise<void>((accept) => {
    setTimeout(() => accept(), durationMillis);
  });
}

/**
 * Interleave several async iterables, yielding whichever produces a value first.
 *
 * Hand-written rather than an async generator, for the same reason as the subscription registry in
 * lib/utils/subscriptions.ts: a generator parked on an `await` cannot be unwound, because `return()`
 * on it is only queued until that await settles. As a generator this sat on the race below, so a
 * consumer that stopped early left every source open until the next event arrived.
 */
export function mergeAsyncIterators<T>(...sources: AsyncIterable<T>[]): AsyncIterableIterator<T> {
  type State = {
    iterator: AsyncIterator<T>;
    next: Promise<{ state: State; result: IteratorResult<T> }>;
  };

  const advance = (state: State) => {
    state.next = state.iterator.next().then((result) => ({ state, result }));
    // settled by whoever races it; this only stops a rejection going unhandled in the meantime
    void state.next.catch(() => {});
  };

  const states: State[] = sources.map((source) => {
    const state = { iterator: source[Symbol.asyncIterator]() } as State;
    advance(state);
    return state;
  });

  let done = false;

  const close = () => {
    done = true;
    // fire and forget: a source may itself be a generator whose return() is queued, and we must not
    // make our own return() wait on that
    for (const state of states) void state.iterator.return?.();
    states.length = 0;
  };

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next(): Promise<IteratorResult<T>> {
      while (!done && states.length > 0) {
        const { state, result } = await Promise.race(states.map((s) => s.next));
        if (done) break;
        if (result.done) {
          const index = states.indexOf(state);
          if (index !== -1) states.splice(index, 1);
          continue;
        }
        advance(state);
        return { done: false, value: result.value };
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
}

/**
 * Yield only the values a predicate accepts. Hand-written for the same reason as
 * {@link mergeAsyncIterators}: so that stopping promptly closes the source.
 */
export function filterAsyncIterator<T>(
  source: AsyncIterable<T>,
  predicate: (value: T) => boolean,
): AsyncIterableIterator<T> {
  const iterator = source[Symbol.asyncIterator]();
  let done = false;

  const close = () => {
    done = true;
    void iterator.return?.();
  };

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next(): Promise<IteratorResult<T>> {
      while (!done) {
        const result = await iterator.next();
        if (done || result.done) break;
        if (predicate(result.value)) return { done: false, value: result.value };
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
}

/**
 * Collapse a burst of events into a single tick and drop anything that arrives while the consumer is
 * still busy. Consumers that refetch everything on each tick only need to know that *something*
 * changed, so handling events individually multiplies load for nothing: one sign in emits several
 * events, and every connected client was running the full refetch for each of them.
 */
export async function* coalesce(source: AsyncIterable<unknown>, delay = 250): AsyncGenerator<void> {
  const iterator = source[Symbol.asyncIterator]();
  let dirty = false;
  let finished = false;
  let wake: (() => void) | null = null;

  const notify = () => {
    const resolve = wake;
    wake = null;
    resolve?.();
  };

  void (async () => {
    try {
      while (true) {
        const { done } = await iterator.next();
        if (done) break;
        dirty = true;
        notify();
      }
    } finally {
      finished = true;
      notify();
    }
  })().catch(() => {}); // the only sources here are Redis subscriptions, which log their own failures

  try {
    while (!finished || dirty) {
      if (!dirty) {
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
        continue;
      }
      // trailing edge, so the rest of the burst lands before we do the work
      await new Promise((resolve) => setTimeout(resolve, delay));
      dirty = false;
      yield;
    }
  } finally {
    // Fire and forget: calling return() on a generator that is suspended mid-await only queues the
    // return until that await settles, so awaiting it here would block until the next event arrives
    // — which, for a subscription that has gone quiet, may be never. Same reason we don't await the
    // pump: it unwinds on its own once the source produces or closes.
    void iterator.return?.();
  }
}
