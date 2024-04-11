import {createFileRoute, Link, useSearch} from "@tanstack/react-router";
import React, {useEffect} from "react";
import {AppDispatch} from "@/redux/store.ts";
import {useDispatch} from "react-redux";
import {authActions} from "@/redux/auth/auth.slice.ts";
import Title from "@/components/title";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ui/components/ui/card.tsx";
import {Button} from "@ui/components/ui/button.tsx";
import {EnvelopeOpenIcon} from "@radix-ui/react-icons";


const Index: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const {redirect = "/"}: {redirect: string} = useSearch({strict: false});

    useEffect(() => {
        dispatch(authActions.setRedirect(redirect));
    }, []);

    return (
        <>
            <Title prompt="Login" />
            <Card className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow-md space-y-4">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Please chose a method to login with
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link to={`${import.meta.env.VITE_API_URL}/authentication/login`} className="flex justify-center">
                        <Button>
                            <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Login with Google
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </>
    );
};


export const Route = createFileRoute('/auth/login/')({
    component: Index,
})

