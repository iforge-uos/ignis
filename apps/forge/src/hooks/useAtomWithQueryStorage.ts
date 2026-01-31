// originally from https://kunjan.in/2025/01/combining-jotai-localstorage-and-react-query-a-powerful-state-management-pattern

import { atomWithStorage } from "jotai/utils";
import { atomWithQuery } from "jotai-tanstack-query";
import { atom } from "jotai";
import { QueryFunction, QueryKey } from "@tanstack/react-query";

type AtomWithQueryStorageOptions<T> = {
  key: string; // Unique key for local storage
  queryKey: QueryKey;
  queryFn: QueryFunction<T>;
  staleTime?: number; // Duration after which data is considered stale (default: 1 hour)
};

export type AtomAction<T> =
  | { type: "update" }
  | { type: "invalidate" }
  | { type: "resetError" }
  | { type: "set"; newData: T };

/**
 * Creates an atom that combines Tanstack Query with local storage caching.
 *
 * @returns An atom that provides { data, error, loading } and supports actions:
 *          - update: Fetches fresh data
 *          - invalidate: Clears cached data
 *          - resetError: Clears error state
 *          - set: Manually updates data
 */
export const atomWithQueryStorage = <T>({
  key,
  queryKey,
  queryFn,
  staleTime = 60 * 60 * 1000,
}: AtomWithQueryStorageOptions<T>) => {
  // Atom for local storage persistence
  const storageAtom = atomWithStorage<{
    data: T | null | undefined;
    timestamp: number | null;
  }>(key, {
    data: null,
    timestamp: null,
  });

  // Atom for query error state
  const errorAtom = atom<Error | null>(null);

  // Atom for managing the query state
  const queryAtom = atomWithQuery((get) => ({
    queryKey,
    queryFn,
    staleTime: staleTime, // Add this to control query staleness
    enabled: !get(storageAtom).data || Date.now() - (get(storageAtom).timestamp || 0) > staleTime,
  }));

  // Add a new atom for loading state
  const loadingAtom = atom<boolean>(false);

  // Combined atom for loading, error, and data states
  return atom(
    (get) => {
      const { data, timestamp } = get(storageAtom);
      const error = get(errorAtom);
      const isLoading = get(loadingAtom);

      const isStale = !timestamp || Date.now() - timestamp > staleTime;
      const queryResult = get(queryAtom);

      return {
        data: !isStale && data ? data : queryResult.data,
        error: error || queryResult.error, // Include both error sources
        loading: isLoading || (!data && isStale && !queryResult.data),
      };
    },
    (get, set, action: AtomAction<T>) => {
      if (action.type === "update") {
        set(loadingAtom, true); // Set loading before the query
        try {
          const freshData = get(queryAtom);
          set(storageAtom, { data: freshData.data, timestamp: Date.now() });
          set(errorAtom, freshData.error);
        } catch (error) {
          set(errorAtom, error as Error);
        } finally {
          set(loadingAtom, false); // Ensure loading is set to false after query
        }
      }

      if (action.type === "invalidate") {
        set(storageAtom, { data: null, timestamp: null }); // Clear storage
        set(loadingAtom, false);
        set(errorAtom, null);
      }

      if (action.type === "resetError") {
        set(errorAtom, null); // Reset error state
        set(loadingAtom, false);
      }

      if (action.type === "set") {
        set(storageAtom, { data: action.newData, timestamp: Date.now() }); // Manually update data
        set(loadingAtom, false);
        set(errorAtom, null);
      }
    },
  );
};
