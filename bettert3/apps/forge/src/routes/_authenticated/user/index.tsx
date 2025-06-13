import { useUser } from "@/hooks/useUser";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute({
  component: () => <Navigate to="/users/$id" params={useUser()!} />, // user cannot be null due to middleware
});
