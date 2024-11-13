// src/components/AuthProvider.tsx
import React from "react";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import { Loader } from "@ui/components/ui/loader";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useVerifyAuthentication();

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
};