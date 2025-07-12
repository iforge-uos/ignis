import Lottie from "react-lottie-player";
import hammerUrl from "/loaders/hammer.json?url";

export function Hammer({ className }: { className?: string }) {
  return (
    // <section className={cn("flex h-full w-full items-center justify-center", className)}>
    <Lottie path={hammerUrl} loop play className="h-40 w-40" />
    // </section>
  );
}
