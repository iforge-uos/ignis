import Title from "@/components/title";
import { Button } from "@packages/ui/components/button";
import Sentry from "@sentry/tanstackstart-react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const GenericError = ({ error }: { error: Error }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <>
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
              <a href={import.meta.env.VITE_DISCORD_URL}>
                <Button variant="hyperlink">Discord server</Button>
              </a>
              .
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <Link to="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
            {/* FIXME below line doesn't actually work and I need to get back to revision */}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
