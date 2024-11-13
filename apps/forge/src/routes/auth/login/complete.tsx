import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/components/ui/loader";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import { useAtom } from "jotai";
import { previousPathnameAtom } from "@/atoms/authSessionAtoms.ts";

export const CompleteComponent = () => {
  const { user, loading } = useVerifyAuthentication();
  const [redirect] = useAtom(previousPathnameAtom); // Get the stored redirect path

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace={true} />;
  }

  // Redirect to the stored path, or default to a specific path if null
  return <Navigate to={redirect || "/"} replace={true} />;
};

export const Route = createFileRoute("/auth/login/complete")({
  component: CompleteComponent,
});
