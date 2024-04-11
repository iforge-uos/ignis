import {Input} from "@ui/components/ui/input";
import React, {useState, useRef, useEffect, Fragment, useImperativeHandle, forwardRef} from "react";

type OtpInputProps = {
    length: number;
    onOtpChange: (otp: number) => void;
    onSubmit: (otp: number) => void;
    stripChars?: number;
}

export type OtpInputHandle = {
    clearOtp: () => void;
};


const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(({
                                                                length,
                                                                onOtpChange,
                                                                onSubmit,
                                                                stripChars = 3
                                                            }, ref) => {
    const [tempOtp, setTempOtp] = useState<string[]>(new Array(length).fill(""));
    const [activeOtpIndex, setActiveOtpIndex] = useState<number>(0);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleOnchange = ({target}: React.ChangeEvent<HTMLInputElement>, index: number): void => {
        const newOtp = [...tempOtp];
        newOtp[index] = target.value;

        setTempOtp(newOtp);
        const otpValue = newOtp.join("");
        const strippedOtpValue = parseInt(getStrippedOtpValue(otpValue), 10) || 0
        onOtpChange(strippedOtpValue);

        // Automatically move to the next input after a value is entered
        if (target.value && index < length - 1) {
            setActiveOtpIndex(index + 1);
        }
    };

    const getStrippedOtpValue = (otp: string) => {
        return otp.substring(stripChars);
    };

    useImperativeHandle(ref, () => ({
        clearOtp,
        submitOtp
    }));

    const submitOtp = () => {
        const otpValue = tempOtp.join("");
        if (otpValue.length === length) {
            // Strip out the first three values
            const strippedOtpValue = getStrippedOtpValue(otpValue);
            onSubmit(strippedOtpValue ? parseInt(strippedOtpValue, 10) : 0);
        }
    };


    const clearOtp = () => {
        // Reset the OTP array to initial state
        const clearedOtp = new Array(length).fill("");
        setTempOtp(clearedOtp);
        // Reset the active index to 0 so the focus goes back to the first input
        setActiveOtpIndex(0);
        // Call the onOtpChange prop with 0 to indicate the OTP has been cleared
        onOtpChange(0);
    };


    const handleOnKeyDown = ({key}: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (key === "Backspace") {
            if (tempOtp[index]) {
                // If there is a value in the current input, clear it
                const newOtp = [...tempOtp];
                newOtp[index] = ''; // Clear the current input
                setTempOtp(newOtp);
                // Optionally call the onOtpChange callback
                onOtpChange(parseInt(getStrippedOtpValue(newOtp.join('')), 10) || 0);
            } else if (index > 0) {
                // If the current input is empty, remove the last digit from the previous input
                const newOtp = [...tempOtp];
                newOtp[index - 1] = ''; // Clear the previous input
                setTempOtp(newOtp);
                setActiveOtpIndex(index - 1); // Set the previous index as active
                // Optionally call the onOtpChange callback
                onOtpChange(parseInt(getStrippedOtpValue(newOtp.join('')), 10) || 0);
            }
        } else if (key === "Enter") {
            submitOtp();
        }
    };

    useEffect(() => {
        // Focus only if the input is empty and we are not backspacing
        if (!tempOtp[activeOtpIndex]) {
            inputsRef.current[activeOtpIndex]?.focus();
        }
    }, [activeOtpIndex, tempOtp]);

    const inputClassName = `border-none
                        text-lg md:text-x
                        w-12 h-12
                        text-center 
                        focus:outline-none
                        bg-gray-100 dark:bg-background
                        `;

    return (
        <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="flex space-x-2">
                {tempOtp.map((value, index) => (
                    <Fragment key={index}>
                        <Input
                            ref={(el) => (inputsRef.current[index] = el)}
                            onChange={(e) => handleOnchange(e, index)}
                            onKeyDown={(e) => handleOnKeyDown(e, index)}
                            className={`${inputClassName} focus:outline-none`}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={value}
                        />
                    </Fragment>
                ))}
            </div>
        </div>
    );
});

export default OtpInput;