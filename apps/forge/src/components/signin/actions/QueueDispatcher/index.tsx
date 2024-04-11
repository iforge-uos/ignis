import {Alert, AlertDescription, AlertTitle} from "@ui/components/ui/alert.tsx";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import {useMutation} from "@tanstack/react-query";
import {AppDispatch, AppRootState} from "@/redux/store.ts";
import {useDispatch, useSelector} from "react-redux";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@ui/components/ui/card.tsx";

import {Loader} from "@ui/components/ui/loader.tsx";
import {Button} from "@ui/components/ui/button.tsx";
import {useState} from "react";
import {signinActions} from "@/redux/signin/signin.slice.ts";
import {FlowStepComponent} from "@/components/signin/actions/SignInManager/types.ts";
import {useNavigate} from "@tanstack/react-router";
import {toast} from "sonner";
import {PostQueueInPerson, PostQueueProps} from "@/services/signin/queueService.ts";


const QueueDispatcher: FlowStepComponent = ({onSecondary, onPrimary}) => {
    const dispatch: AppDispatch = useDispatch();
    const signInSession = useSelector((state: AppRootState) => state.signin.session)
    const activeLocation = useSelector((state: AppRootState) => state.signin.active_location)
    const abortController = new AbortController(); // For gracefully cancelling the query
    const [canContinue, setCanContinue] = useState<boolean>(false)
    const navigate = useNavigate()
    const timeout = 3000

    const queueProps: PostQueueProps = {
        locationName: activeLocation,
        uCardNumber: signInSession?.ucard_number ?? 0,
        signal: abortController.signal,
    };


    const {isPending, error, mutate} = useMutation({
        mutationKey: ['postQueueInPerson', queueProps],
        mutationFn: () => PostQueueInPerson(queueProps),
        retry: 0,
        onError: (error) => {
            console.log('Error', error)
            abortController.abort();
        },
        onSuccess: () => {
            console.log('Success')
            setCanContinue(true)
            abortController.abort();
            redirectToActions(timeout)
            toast.success('User added to queue successfully')
        },
    });

    const errorDisplay = (error: Error | null) => {

        if (error) {

            return (
                <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4"/>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error.message}
                    </AlertDescription>
                </Alert>
            )

        }
        return (

            <>
                <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4"/>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        There was an error with your session, try again! <br/>
                        Error: "Unknown"
                    </AlertDescription>
                </Alert>
            </>
        )
    }

    const redirectToActions = (timeoutInMs: number) => {
        setTimeout(() => {
            dispatch(signinActions.resetSignInSession());
            navigate({to: '/signin/actions'})
        }, timeoutInMs)
    }


    const successDisplay = (
        <>
            <div className="flex justify-items-center justify-center">
                <h1 className="text-xl flex-auto">Success!</h1>
                <p className="text-sm">Possibly redirecting to actions page in ~{timeout / 1000} seconds...</p>
            </div>
        </>
    )

    const handleSecondaryClick = () => {
        abortController.abort();
        onSecondary?.();
    }

    const handlePrimaryClick = () => {
        if (canContinue) {
            abortController.abort();
            onPrimary?.();
            console.log('Done ')
            dispatch(signinActions.resetSignInSession());
        }
    }


    return (
        <>
            <Card className="w-[700px]">
                <CardHeader>
                    <CardTitle>Adding User to Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    {!canContinue && !error && !isPending && (
                        <Button onClick={() => mutate()} autoFocus={true} variant="outline"
                                className="h-[200px] w-full">Join Queue</Button>
                    )}
                    {isPending && <Loader/>}
                    {!isPending && error && !canContinue && errorDisplay(error)}
                    {!isPending && canContinue && successDisplay}
                </CardContent>
                <CardFooter className="flex justify-between flex-row-reverse">
                    <Button onClick={handlePrimaryClick} disabled={!canContinue}>Continue</Button>
                    <Button onClick={handleSecondaryClick} variant="outline">Go Back</Button>
                </CardFooter>
            </Card>
        </>
    );
};


export default QueueDispatcher