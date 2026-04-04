import { activeLocationAtom, initializeSessionAtom, sessionUcardNumberAtom, sessionUserAtom } from "@/atoms/signInAppAtoms";
import { UCARD_LENGTH } from "@/lib/constants";
import { FlowStepComponent } from "@/types/signInActions";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@packages/ui/components/input-otp";
import { useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

const UCardInput = () => {
  const [uCardNumber, setUcardNumber] = useAtom(sessionUcardNumberAtom);
  const [, setUser] = useAtom(sessionUserAtom);
  const initializeSession = useSetAtom(initializeSessionAtom);
  const [otp, setOtp] = useState(uCardNumber ?? "");
  const [isOtpValid, setIsOtpValid] = useState(otp.length === UCARD_LENGTH);
  const navigate = useNavigate()
  const location = useAtomValue(activeLocationAtom)

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setIsOtpValid(value.length === UCARD_LENGTH);
  };

  const handleClear = () => {
    console.log("Clearing OTP");
    setOtp("");
    // Update individual atoms instead of session
    setUcardNumber("");
    setUser(null);
  };

  const handleOnSubmit = () => {
    if (isOtpValid) {
      initializeSession(otp);
      navigate({to: "/sign-in/$location/$ucard_number", params: {location, ucard_number: uCardNumber as any}})
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>UCard Input</CardTitle>
        <CardDescription>Enter your UCard number</CardDescription>
      </CardHeader>
      <CardContent>
        <InputOTP
          autoFocus
          maxLength={9}
          value={otp}
          onChange={(value) => handleOtpChange(value)}
          onComplete={() => handleOnSubmit()}
          pushPasswordManagerStrategy="none"
          data-lpignore="true"
          data-1p-ignore="true"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
            <InputOTPSlot index={8} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardFooter className="flex justify-between flex-row-reverse">
        <Button onClick={() => handleOnSubmit()} disabled={!isOtpValid} aria-disabled={!isOtpValid}>
          Submit
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UCardInput;
