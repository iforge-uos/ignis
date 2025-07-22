import Title from "@/components/title";
import { createFileRoute } from "@tanstack/react-router";

function Component() {
  return (
    <>
      <Title prompt="Finished Training" />
      <br />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-center">Training Complete</h1>
        <p className="text-center text-foreground">Congratulations! You have successfully completed the training.</p>
      </div>
    </>
  );
}

export const Route = createFileRoute("/training/finished")({
  component: Component,
});
