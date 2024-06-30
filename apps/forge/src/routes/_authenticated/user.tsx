import { createFileRoute } from "@tanstack/react-router";
import {NotFound} from "@/components/routing/NotFound.tsx";

export const Route = createFileRoute("/_authenticated/user")({
  staticData: { title: "User" },
  notFoundComponent: NotFound,
});
