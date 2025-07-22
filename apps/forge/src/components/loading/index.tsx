import Lottie from "react-lottie-player";
import hammerUrl from "/loaders/hammer.json?url";

export function Hammer({ className }: { className?: string }) {
  return (
    <Lottie path={hammerUrl} loop play className="h-40 w-40" />
  );
}
