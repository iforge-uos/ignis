import { type Theme, getTheme, setTheme } from '@/lib/theme'
import { Route } from '@/routes/__root'
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'

export const themeQueryKey = ['theme'] as const

export const themeQueryOptions = () => {
  return queryOptions({
    queryKey: themeQueryKey,
    queryFn: getTheme,
  })
}

export const useOptimisticThemeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (theme: Theme | 'system') => setTheme({ data: theme }),
    onMutate: async (theme) => {
      await queryClient.cancelQueries({ queryKey: themeQueryKey })

      const previousTheme = queryClient.getQueryData(themeQueryKey)
      const nextTheme = theme === 'system' ? null : theme

      queryClient.setQueryData(themeQueryKey, nextTheme)

      return { previousTheme }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(themeQueryKey, context?.previousTheme)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: themeQueryKey })
    },
  })
}

export const useTheme = () => {
  const { requestInfo } = Route.useLoaderData()
  const { data: theme } = useSuspenseQuery(themeQueryOptions())

  return theme ?? requestInfo.hints.theme
}