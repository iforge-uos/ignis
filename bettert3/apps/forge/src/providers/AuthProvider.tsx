import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import Loader from "@packages/ui/components/loader";
// src/components/AuthProvider.tsx
import React from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useVerifyAuthentication();

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
};
