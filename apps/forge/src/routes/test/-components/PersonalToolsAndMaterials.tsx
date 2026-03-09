import { useEffect } from "react";
import { useSignIn } from "/src/providers/SignInSteps";
import { FlowStepComponent } from "/src/types/signInActions";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Button } from "@packages/ui/components/button";
import { Input } from "@packages/ui/components/input";

export const PersonalToolsAndMaterials: FlowStepComponent<"PERSONAL_TOOLS_AND_MATERIALS"> = ({ user }) => {
  const { finalise, setCanContinue, focusNextStep } = useSignIn<"PERSONAL_TOOLS_AND_MATERIALS">(async (transmit) => {
    await transmit({});
  });

  useEffect(() => {
    setCanContinue(true);
    focusNextStep();
  });

  return (
    <>
    <CardHeader>
      <CardTitle>Personal Tools and Materials</CardTitle>
      <CardDescription>Is this user using any personal tools or materials?</CardDescription>
    </CardHeader>
    <CardContent className="space-x-5">
      <Input></Input>
    </CardContent>
    </>
  );};
