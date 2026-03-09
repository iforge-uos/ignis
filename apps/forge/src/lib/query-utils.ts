import type { QueryClient, UseQueryOptions } from "@tanstack/react-query";

/**
 * Ensures query data is loaded, optionally catching errors and returning null
 * This is useful for preventing x2 the requests to the backend between SSR and CSR
 */
export async function ensureQueryData<T>(
  queryClient: QueryClient,
  queryOptions: UseQueryOptions<T>,
  options: { catchErrors: true },
): Promise<T | null>
export async function ensureQueryData<T>(
  queryClient: QueryClient,
  queryOptions: UseQueryOptions<T>,
  options?: { catchErrors?: false },
): Promise<T>
export async function ensureQueryData<T>(
  queryClient: QueryClient,
  queryOptions: UseQueryOptions<T>,
  options: { catchErrors?: boolean } = {},
): Promise<T | null> {
  const { catchErrors = false } = options;

  if (catchErrors) {
    try {
      return await queryClient.ensureQueryData({
        ...queryOptions,
        revalidateIfStale: true,
      });
    } catch (_) {
      // Cache null so subsequent calls within staleTime return immediately
      // without a network request. Without this, errored queries have no cached
      // data (undefined), causing ensureQueryData to always re-fetch.
      queryClient.setQueryData(queryOptions.queryKey!, null);
      return null;
    }
  }

  return await queryClient.ensureQueryData({
    ...queryOptions,
    revalidateIfStale: true,
  });
}
