import { previousPathnameAtom } from "@/atoms/authSessionAtoms.ts";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Loader } from "@ui/components/ui/loader";
import {useAtom} from "jotai";

export const CompleteComponent = () => {
  const { user, loading } = useVerifyAuthentication();
  const [redirect] = useAtom(previousPathnameAtom); // Get the stored redirect path

  console.log(
    "redirect",
    redirect)


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
