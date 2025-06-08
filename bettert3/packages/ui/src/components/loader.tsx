import { cn } from "@packages/ui/lib/utils";
import React from "react";
import { PulseLoader } from "react-spinners";

export default ({ className, size }: { className?: string; size?: number }) => {
  return (
    <section className={cn("flex h-full w-full items-center justify-center", className)}>
      <PulseLoader color="#e11d48" size={size ?? 20} />
    </section>
  );
};
