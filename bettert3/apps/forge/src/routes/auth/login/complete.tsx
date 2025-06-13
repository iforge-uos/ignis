import { previousPathnameAtom } from "@/atoms/authSessionAtoms";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import Loader from "@packages/ui/components/loader";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export const CompleteComponent = () => {
  const { user, loading } = useVerifyAuthentication();
  const [redirect] = useAtom(previousPathnameAtom);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Add a small delay to ensure all state updates have been processed
      const timer = setTimeout(() => {
        setVerificationComplete(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  if (loading || !verificationComplete) {
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
