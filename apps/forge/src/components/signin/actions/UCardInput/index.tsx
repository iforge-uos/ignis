import { FlowStepComponent } from "@/components/signin/actions/SignInManager/types.ts";
import { signinActions } from "@/redux/signin.slice.ts";
import { AppDispatch } from "@/redux/store.ts";
import { Button } from "@ui/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@ui/components/ui/input-otp";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const UCardInput: FlowStepComponent = ({ onPrimary }) => {
  const [otp, setOtp] = useState(""); // OTP is now handled as a string
  const [isOtpValid, setIsOtpValid] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const UCARD_LENGTH = 9; // Total length of the OTP

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
      const parsedOtp = parseInt(otp.slice(-6), 10);
      dispatch(signinActions.updateSignInSessionField("ucard_number", parsedOtp));
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
            maxLength={9}
            value={otp}
            onChange={(value) => handleOtpChange(value)}
            onComplete={() => handleOnSubmit()}
            ref={firstInputRef}
            type="search" // I think this turns off 1password autocomplete which gets in the way of our actual auto-complete
            autoComplete="off" // so does this
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
      <script>
        const element = document.getElementById("starting-pos").focus(); document.getElementById(frmObj.id).select();
      </script>
    </>
  );
};

export default UCardInput;
