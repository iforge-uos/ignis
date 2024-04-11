import {FlowStepComponent} from "@/components/signin/actions/SignInManager/types.ts";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@ui/components/ui/card.tsx";
import {Button} from "@ui/components/ui/button.tsx";
import {Input} from "@ui/components/ui/input.tsx";
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/redux/store.ts";
import {signinActions} from "@/redux/signin/signin.slice.ts";


const SignInRegisterForm: FlowStepComponent = ({onSecondary, onPrimary}) => {
    const dispatch: AppDispatch = useDispatch();
    const [userInput, setUserInput] = useState<string>("")
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateInput = (input: string) => {
        if (input.length < 6) {
            setValidationError("Username must be at least 6 characters long.");
            return false;
        }

        setValidationError(null);
        return true;
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
        validateInput(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        // Example: Submit on Enter key
        if (event.key === 'Enter' && validateInput(userInput)) {
            handlePrimaryClick();
        }
    };

    const handlePrimaryClick = () => {
        if (validateInput(userInput)) {
            dispatch(signinActions.updateSignInSessionField("username", userInput));
            onPrimary?.();
        }
    };

    const handleSecondaryClick = () => {
        onSecondary?.()
    }

    return (
        <>
            <Card className="w-[700px]">
                <CardHeader>
                    <CardTitle>Registering User</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Input
                            autoFocus={true}
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your username..."
                            className="mb-2"
                        />
                        {validationError && <p className="text-red-500">{validationError}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between flex-row-reverse">
                    <Button onClick={handlePrimaryClick} disabled={!!validationError}>Continue</Button>
                    <Button onClick={handleSecondaryClick} variant="outline">Go Back</Button>
                </CardFooter>
            </Card>
        </>
);
};

export default SignInRegisterForm;
