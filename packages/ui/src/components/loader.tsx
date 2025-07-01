import { cn } from "@packages/ui/lib/utils";
import React from "react";
import pkg from "react-spinners";
const { PulseLoader } = pkg;

export default ({ className, size }: { className?: string; size?: number }) => {
  return (
    <section className={cn("flex h-full w-full items-center justify-center", className)}>
      <PulseLoader color="#e11d48" size={size ?? 20} />
    </section>
  );
};
