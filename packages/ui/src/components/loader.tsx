import { cn } from "@packages/ui/lib/utils";
import animation from "public/loaders/hammer.json";
import React from "react";
import Lottie from "react-lottie-player";

export default ({ className }: { className?: string }) => {
  return (
    <section className={cn("flex h-full w-full items-center justify-center", className)}>
      <Lottie animationData={animation} />;{" "}
    </section>
  );
};
