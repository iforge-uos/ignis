import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication.ts";
import { User } from "@ignis/types/users.ts";
import * as React from "react";
import { Loading } from "../routing/Loading";

export interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser } = useVerifyAuthentication();

  if (loading) {
    return <Loading />;
  }

  const isAuthenticated = !!user;

  const logout = () => {
    setUser(null);
  };

  const contextValue = { isAuthenticated, user, logout };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
