import { Button } from "@packages/ui/components/button";
import { CardFooter } from "@packages/ui/components/card";
import { redirect } from "@tanstack/react-router";
import { toTitleCase } from "@/lib/utils";
import { useSignIn } from "@/providers/SignInSteps";
import { StepType } from "../$name.$ucard_number";

interface SignInNavProps {
  steps: StepType[]
  setSteps: React.Dispatch<React.SetStateAction<StepType[]>>
  ref: React.RefObject<HTMLButtonElement | undefined>
}

export default ({steps, setSteps, ref}: SignInNavProps) => {
  // @ts-expect-error: Passing undefined to useSignIn is valid only in this instance
  const { canContinue, finalise } = useSignIn<StepType>(undefined);
  const previousStep = steps.at(-2)


  return (
    <CardFooter className="flex justify-between">
      <Button
        variant="outline"
        onClick={async () => {
          if (previousStep === "INITIALISE") throw redirect({to: "/"});
          setSteps((steps) => [...steps, previousStep!]);
        }}
      >
        {previousStep !== "INITIALISE" ? `Back to ${toTitleCase(previousStep?.replace("_", " ") ?? "")}` : "Cancel Sign In"}
      </Button>
      <Button
        onClick={finalise}
        disabled={!canContinue}
        ref={ref}
      >
        Next Step
      </Button>
    </CardFooter>
  );
};
