import { createStart } from '@tanstack/react-start'
import { tanstackSerialisers } from "@/lib/serialisers"

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
    serializationAdapters: tanstackSerialisers,
  }
})