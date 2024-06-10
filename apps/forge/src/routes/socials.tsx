import { createFileRoute } from "@tanstack/react-router";
import {NotFound} from "@/components/routing/NotFound.tsx";

export const Route = createFileRoute("/socials")({
	staticData: { title: "Socials" },
	notFoundComponent: NotFound,
});
