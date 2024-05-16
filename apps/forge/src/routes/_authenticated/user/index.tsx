import { useUser } from "@/lib/utils";
import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/user/")({
  component: () => <Navigate to="/users/$id" params={useUser()!} />, // user cannot be null due to middleware
});
