import {createFileRoute} from "@tanstack/react-router";
import SignInDashboard from "@/components/signin/dashboard";



export const Route = createFileRoute('/_authenticated/_reponly/signin/dashboard')({
    component: SignInDashboard
})