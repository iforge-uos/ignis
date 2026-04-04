import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { activeLocationAtom } from "@/atoms/signInAppAtoms";

export const Route = createFileRoute("/_redirects/sign-in/")({
  beforeLoad: () => {
    throw redirect({
      to: "/sign-in/$location",
      params: { location: useAtomValue(activeLocationAtom) },
    });
  },
});
