import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useUser } from "@/hooks/useUser";

export const Route = createFileRoute("/_authenticated/user/")({
  component: () => <Navigate to="/users/$id" params={useUser()!} />, // user cannot be null due to middleware
});
