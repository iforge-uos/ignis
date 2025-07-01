import { previousPathnameAtom } from "@/atoms/authSessionAtoms";
import Title from "@/components/title";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Skeleton } from "@packages/ui/components/skeleton";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Info } from "lucide-react";
import { useEffect } from "react";

function LoadingState() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <Card className="w-[350px]">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginModal() {
  const navigate = useNavigate();
  const { user, loading } = useVerifyAuthentication();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const [previousPathname, setPreviousPathname] = useAtom(previousPathnameAtom);

  useEffect(() => {
    // Don't store auth-related paths as previous pathname
    if (!pathname.startsWith("/auth/")) {
      setPreviousPathname(pathname);
    }
  }, [pathname, setPreviousPathname]);

  useEffect(() => {
    if (!loading && user) {
      // If no previous pathname stored or it's an auth path, redirect to home
      const redirectPath = previousPathname && !previousPathname.startsWith("/auth/") ? previousPathname : "/";

      navigate({ to: redirectPath });
      setPreviousPathname(""); // Clear the stored path after redirect
    }
  }, [user, loading, navigate, previousPathname, setPreviousPathname]);

  if (loading) {
    return <LoadingState />;
  }

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
            <Link to={`${import.meta.env.VITE_API_URL}/auth/oauth`} className="flex justify-center">
              <Button variant="default" className="w-full">
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
            </Link>
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
