import { createFileRoute } from "@tanstack/react-router";
import {NotFound} from "@/components/routing/NotFound.tsx";

export const Route = createFileRoute("/training")({
  staticData: { title: "Training" },
  notFoundComponent: NotFound,

});
