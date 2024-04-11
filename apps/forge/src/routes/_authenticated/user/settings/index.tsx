import Title from "@/components/title";
import {createFileRoute} from "@tanstack/react-router";


const UserSettingsPageComponent = () => {

    return (
        <>
            <Title prompt="Settings"/>
            <div className="p-2">
                <h3>USER SETTINGS PAGE</h3>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/user/settings/')({component: UserSettingsPageComponent})
