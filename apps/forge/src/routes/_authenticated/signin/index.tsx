import {createFileRoute} from "@tanstack/react-router";
import Title from "@/components/title";
import ActiveLocationSelector from "@/components/signin/actions/ActiveLocationSelector";
import {BentoGrid, BentoGridItem} from "@ui/components/bento-grid.tsx";
import {Bitcoin, MessageCircleMore} from "lucide-react";
import { useUser } from "@/lib/utils";

const SignInAppComponent = () => {

    const Skeleton = () => (
        <div
            className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
    );
    const items = [
        {
            title: "iForge Discord",
            description: "Join the iForge Discord if you haven't already.",
            header: <Skeleton/>,
            icon: <MessageCircleMore className="h-4 w-4 text-neutral-500"/>,
            externalLink: import.meta.env.VITE_DISCORD_URL,
        },
    ];
    const user = useUser();

    if (user?.roles.some((role) => role.name.includes("Rep"))) {
        items.push(
            {
                title: "Add Training Record",
                description: "Dive into the transformative power of technology.",
                header: <Skeleton/>,
                icon: <Bitcoin className="h-4 w-4 text-neutral-500"/>,
                externalLink: "https://training.iforge.shef.ac.uk/admin/training_records/new"
            },
            {
                title: "Purchase Form",
                description: "Discover the beauty of thoughtful and functional design.",
                header: <Skeleton/>,
                icon: <Bitcoin className="h-4 w-4 text-neutral-500"/>,
                externalLink: "https://docs.google.com/forms/d/e/1FAIpQLScdLTE7eXqGQRa3e0UfymYo8qjlNTyu5xfIyArMG0wGQgHjyw/viewform"
            },
            {
                title: "iDocs",
                description:
                    "Understand the impact of effective communication in our lives.",
                header: <Skeleton/>,
                icon: <Bitcoin className="h-4 w-4 text-neutral-500"/>,
                externalLink: "https://docs.iforge.shef.ac.uk"
            }
        )
    }

    return (
        <>
            <Title prompt="Signin App Home"/>
            <div className="p-4 mt-1">
                <ActiveLocationSelector/>
                <div className="border-2 p-4">
                    <h1 className="text-xl font-bold mb-4 text-center">Sign In Home (Please excuse the visual inconsistencies)</h1>
                    <BentoGrid className="max-w-4xl mx-auto">
                        {items.map((item, i) => (
                            <BentoGridItem
                                key={i}
                                title={item.title}
                                description={item.description}
                                header={item.header}
                                icon={item.icon}
                                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                                externalLink={item.externalLink}
                            />
                        ))}
                    </BentoGrid>
                </div>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/signin/')({component: SignInAppComponent})
