import { previousPathnameAtom } from "@/atoms/authSessionAtoms";
import Title from "@/components/title";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { EnvelopeOpenIcon } from "@radix-ui/react-icons";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai";
import React, { useEffect } from "react";

const Index: React.FC = () => {
  const [, setPreviousPathname] = useAtom(previousPathnameAtom);

  useEffect(() => {
    setPreviousPathname(window.location.pathname);
  }, [setPreviousPathname]);

  return (
    <>
      <Title prompt="Login" />
      <Card className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow-md space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">Please chose a method to login with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link
            to={`${import.meta.env.VITE_API_URL}/auth/oauth/?provider=builtin::oauth_google`}
            className="flex justify-center"
          >
            <Button>
              <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Login with Google
            </Button>
          </Link>
        </CardContent>
      </Card>
    </>
  );
};

export const Route = createFileRoute("/auth/login/")({
  component: Index,
});
