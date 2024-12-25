import { UCARD_LENGTH } from "@/lib/constants";
import { FlowStepComponent } from "@/types/signInActions";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@ui/components/ui/input-otp";
import { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { initializeSessionAtom, sessionUcardNumberAtom, sessionUserAtom } from "@/atoms/signInAppAtoms.ts";

const UCardInput: FlowStepComponent = ({ onPrimary }) => {
  const [uCardNumber, setUcardNumber] = useAtom(sessionUcardNumberAtom);
  const [, setUser] = useAtom(sessionUserAtom);
  const initializeSession = useSetAtom(initializeSessionAtom);
  const [otp, setOtp] = useState(uCardNumber ?? "");
  const [isOtpValid, setIsOtpValid] = useState(otp.length === UCARD_LENGTH);

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
      onPrimary?.();
    }
  };

  return (
    <>
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
    </>
  );
};

export default UCardInput;
