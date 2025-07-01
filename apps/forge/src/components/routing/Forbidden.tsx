import Title from "@/components/title";
import { Button } from "@packages/ui/components/button";
import { Link } from "@tanstack/react-router";

export const Forbidden = () => {
  return (
    <>
      <Title prompt="Forbidden" />
      <div className="flex items-center justify-center w-full min-h-[80vh] px-4">
        <div className="grid items-center gap-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">403 - Forbidden</h1>
            <p className="max-w-[600px] mx-auto text-accent-foreground md:text-xl/relaxed">
              Some wires have been crossed, you cannot access the requested page.
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <Link to="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
