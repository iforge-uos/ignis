import { RouteUnfinished } from "@/components/routing/RouteUnfinished";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/socials")({ component: RouteUnfinished });
