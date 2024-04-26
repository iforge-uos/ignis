import { FlowStepComponent } from "@/types/signInActions.ts";
import { signinActions, useSignInSessionField } from "@/redux/signin.slice.ts";
import { AppDispatch } from "@/redux/store.ts";
import { Button } from "@ui/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@ui/components/ui/input-otp.tsx";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

const UCardInput: FlowStepComponent = ({ onPrimary }) => {
  const UCARD_LENGTH = 9; // Total length of the OTP
  const dispatch = useDispatch<AppDispatch>();
  const originalUcard = useSignInSessionField("ucard_number");
  const [otp, setOtp] = useState(originalUcard ? originalUcard.toString().padStart(UCARD_LENGTH, "0") : ""); // OTP is now handled as a string
  const [isOtpValid, setIsOtpValid] = useState(otp.length === UCARD_LENGTH);

  const handleOtpChange = (value: string) => {
    setOtp(value); // Set the full value of the OTP input
    setIsOtpValid(value.length === UCARD_LENGTH); // Validation based on the length of the input
  };

  const handleClear = () => {
    console.log("Clearing OTP");
    setOtp(""); // Clear the OTP by resetting the state
  };

  const handleOnSubmit = () => {
    if (isOtpValid) {
      dispatch(signinActions.updateSignInSessionField("ucard_number", otp));
      onPrimary?.();
    }
  };
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  return (
    <>
      <Card className="w-[700px]">
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
            ref={firstInputRef}
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
