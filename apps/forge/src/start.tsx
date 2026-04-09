import { createStart } from '@tanstack/react-start'
import { tanstackSerialisers } from "@/lib/serialisers"
import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
    serializationAdapters: tanstackSerialisers,
    requestMiddleware: [sentryGlobalRequestMiddleware],
    functionMiddleware: [sentryGlobalFunctionMiddleware],
  };
})