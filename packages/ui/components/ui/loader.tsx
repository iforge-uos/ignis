import { cn } from "@/lib/utils";
import { PulseLoader } from "react-spinners";

export const Loader = ({ className, size }: { className?: string; size?: number }) => {
  return (
    <section className={cn("h-full w-full flex justify-center items-center", className)}>
      <PulseLoader color="#e11d48" size={size ?? 20} />
    </section>
  );
};
