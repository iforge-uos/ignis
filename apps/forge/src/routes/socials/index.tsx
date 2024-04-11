import {createFileRoute} from "@tanstack/react-router";
import Title from "@/components/title";

const SocialsIndexPageComponent = () => {
    return (
        <>
            <Title prompt="SOCIALS"/>
            <div className="p-2">
                <h3>iForge Social Media Page</h3>
                <p>WIP</p>
            </div>
        </>
    );
};

export const Route = createFileRoute('/socials/')({
    component: SocialsIndexPageComponent,
});
