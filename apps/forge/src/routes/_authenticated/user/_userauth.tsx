// src/routes/_authenticated.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.ts";

export const Route = createFileRoute("/_authenticated/user/_userauth")({
  beforeLoad: async ({ location }) => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.is_authenticated);
    console.log("isLoggedIn", isLoggedIn);
    if (!isLoggedIn) {
      throw redirect({
        to: "/auth/login",
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
});
