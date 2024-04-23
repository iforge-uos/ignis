import Title from "@/components/title";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button.tsx";
import React from "react";

export const Forbidden = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate({ to: "/" });

  return (
    <React.Fragment>
      <Title prompt="Forbidden" />
      <div className="flex items-center justify-center w-full min-h-[80vh] px-4">
        <div className="grid items-center gap-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">403 - Forbidden</h1>
            <p className="max-w-[600px] mx-auto text-accent-foreground md:text-xl/relaxed">
              Some wires have been crossed, you cannot access the requested page.
            </p>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={goToHome}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
