import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/_authenticated/_3dponly/printing/_3dpadminonly")({
  component: RouteComponent,
});

function RouteComponent() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const verify = useMutation(
    orpc.print.admin.mutationOptions({
      onSuccess: ({ ok }) => {
        setUnlocked(ok);
        setError(!ok);
      },
    }),
  );

  if (unlocked) return <Outlet />;

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Lock className="mb-2 size-8 text-muted-foreground" />
          <CardTitle>3DP Admin</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              verify.mutate({ password });
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoFocus
                placeholder="Hint: Same as last year"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
              />
              {error && <p className="text-sm text-destructive">Incorrect password</p>}
            </div>
            <Button type="submit" disabled={verify.isPending || password.length === 0}>
              {verify.isPending ? "Checking…" : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
