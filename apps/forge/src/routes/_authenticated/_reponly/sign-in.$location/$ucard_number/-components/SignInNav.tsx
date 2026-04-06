import { Button } from "@packages/ui/components/button";
import { CardFooter } from "@packages/ui/components/card";
import { useNavigate } from "@tanstack/react-router";
import { toTitleCase } from "@/lib/utils";
import { useSignIn } from "@/providers/SignInSteps";
import { StepType } from "../index";
import { activeLocationAtom } from "/src/atoms/signInAppAtoms";
import { useAtomValue } from "jotai";

interface SignInNavProps {
  steps: StepType[];
  setSteps: React.Dispatch<React.SetStateAction<StepType[]>>;
  ref: React.RefObject<HTMLButtonElement | undefined>;
}

export default ({ steps, setSteps, ref }: SignInNavProps) => {
  // @ts-expect-error: Passing undefined to useSignIn is valid only in this instance
  const { canContinue, finalise } = useSignIn<StepType>(undefined);
  const previousStep = steps.at(-2);
  const location = useAtomValue(activeLocationAtom);
  const navigate = useNavigate();

  return (
    <CardFooter className="flex justify-between">
      <Button
        variant="outline"
        onClick={async () => {
          if (previousStep === "INITIALISE") return await navigate({ to: "/sign-in/$location", params: { location } });

          setSteps((steps) => [...steps, previousStep!]);
        }}
      >
        {previousStep !== "INITIALISE"
          ? `Back to ${toTitleCase(previousStep?.replace("_", " ") ?? "")}`
          : "Cancel Sign In"}
      </Button>
      <Button onClick={finalise} disabled={!canContinue} ref={ref}>
        Next Step
      </Button>
    </CardFooter>
  );
};
