import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Info } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";
import { previousPathnameAtom } from "@/atoms/authSessionAtoms";
import Title from "@/components/title";
import { startOAuth } from "@/lib/utils/auth";
import { useUser } from "@/hooks/useUser";

const loginSearchSchema = z.object({
  redirect: z.string().default("/"),
});


function LoginPage() {
const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const user = useUser();

  const [previousPathname, setPreviousPathname] = useAtom(previousPathnameAtom);

  useEffect(() => {
    // Don't store auth-related paths as previous pathname
    if (!redirect.startsWith("/auth/")) {
      setPreviousPathname(redirect);
    }
  }, [redirect, setPreviousPathname]);

  useEffect(() => {
    if (user) {
      // Priority: redirect param > previous pathname > home
      const redirectPath =
        redirect || (previousPathname && !previousPathname.startsWith("/auth/") ? previousPathname : "/");

      navigate({ to: redirectPath });
      setPreviousPathname(""); // Clear the stored path after redirect
    }
  }, [user, navigate, previousPathname, setPreviousPathname, redirect]);

  if (user) {
    return null;
  }

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="flex flex-col justify-center items-center">
        <Title prompt="Login" />
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Choose a social provider to login.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="default"
              className="w-full"
              onClick={async () => {
                window.location.href = await startOAuth({ data: { providerName: "builtin::oauth_google" } });
              }}
            >
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
              Continue with Google
            </Button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground text-balance">
              <Info className="h-4 w-4" />
              <p>Please use your university Google account to log in.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth/login/")({
  component: LoginPage,
  validateSearch: loginSearchSchema,
});
