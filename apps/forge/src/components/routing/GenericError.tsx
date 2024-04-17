import { useNavigate } from "@tanstack/react-router";
import Title from "@/components/title";
import { Button } from "@ui/components/ui/button.tsx";
import React from "react";

export const GenericError = () => {
  const navigate = useNavigate();
  const goToHome = () => navigate({ to: "/" });
  const reload = () => navigate({ search: {} });

  return (
    <React.Fragment>
      <Title prompt="Error!" />
      <div className="flex items-center justify-center w-full min-h-[80vh] px-4">
        <div className="grid items-center gap-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">Oopsie! - It broke.</h1>
            <p className="max-w-[600px] mx-auto text-accent-foreground md:text-xl/relaxed">
              Oops! Something has broken! You can try to close to tab and navigate to the site again!
            </p>
            <p className="text-sm text-accent-foreground">
              Note: This site is still under development. For assistance, join our{" "}
              <a className="text-primary" href={import.meta.env.VITE_DISCORD_URL}>
                Discord server
              </a>
              .
            </p>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={goToHome}>
              Go to Homepage
            </Button>
            <Button variant="outline" onClick={reload}>
              Reload
            </Button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
