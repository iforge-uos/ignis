import { useRef, useState } from "react";
import OtpInput, { OtpInputHandle } from "@/components/signin/actions/UCardInput/input.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store.ts";
import { signinActions } from "@/redux/signin.slice.ts";
import { FlowStepComponent } from "@/components/signin/actions/SignInManager/types.ts";

const UCardInput: FlowStepComponent = ({ onPrimary }) => {
  const [otp, setOtp] = useState<number>(0);
  const [isOtpValid, setIsOtpValid] = useState<boolean>(false);
  const otpRef = useRef<OtpInputHandle | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const UCARD_LENGTH = 9;
  const STRIP_CHAR_AMOUNT = 3;
  const VALID_LENGTH = UCARD_LENGTH - STRIP_CHAR_AMOUNT;

  const handleOtpChange = (value: number) => {
    setOtp(value);
    if (getNumberLength(value) === VALID_LENGTH) {
      setIsOtpValid(true);
    }
  };

  const getNumberLength = (num: number): number => {
    return num.toString().length;
  };

  const handleClear = () => {
    console.log("Clearing OTP");
    otpRef?.current?.clearOtp();
  };

  const handleOnSubmit = (otp: number) => {
    if (getNumberLength(otp) === VALID_LENGTH) {
      console.log("Submitting UCard:", otp);
      toast(`UCard Entered: ${otp}`, {
        description: `This is feedback that lets you know what the card has in fact been entered woop woop`,
        action: {
          label: "Woah",
          onClick: () => console.log("ʕ •ᴥ• ʔ"),
        },
      });
      dispatch(signinActions.updateSignInSessionField("ucard_number", otp));
      onPrimary?.();
    }
  };

  return (
    <>
      <Card className="w-[700px]">
        <CardHeader>
          <CardTitle>UCard Input</CardTitle>
          <CardDescription>Enter your UCard number</CardDescription>
        </CardHeader>
        <CardContent>
          <OtpInput
            ref={otpRef}
            length={UCARD_LENGTH}
            stripChars={STRIP_CHAR_AMOUNT}
            onOtpChange={handleOtpChange}
            onSubmit={handleOnSubmit}
          />
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse">
          <Button onClick={() => handleOnSubmit(otp)} disabled={!isOtpValid} aria-disabled={!isOtpValid}>
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
