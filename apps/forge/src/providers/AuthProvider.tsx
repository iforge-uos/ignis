import { Hammer } from "@/components/loading";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
// src/components/AuthProvider.tsx
import React from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <></>;
  const { loading } = useVerifyAuthentication();

  if (loading) {
    <Hammer />;
  }

  return <>{children}</>;
};
