import {createFileRoute} from "@tanstack/react-router";
import Title from "@/components/title";
import {LampContainer} from "@ui/components/lamp.tsx";
import {motion} from "framer-motion";

const IndexComponent = () => {
    return (
        <>
            <Title prompt="Index"/>
            <LampContainer>
                <motion.h1
                    initial={{opacity: 0.5, y: 100}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="mt-8 bg-gradient-to-br from-slate-500 to-slate-900 dark:from-slate-300 dark:to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
                >
                    iForge <br/> <p className="mt-2 uppercase text-m text-sm"></p>
                </motion.h1>
            </LampContainer>
        </>
    );
};

export const Route = createFileRoute("/")({component: IndexComponent});
