import Title from "@/components/title";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button.tsx";
import UwUImage from "@/components/images/UwUImage.tsx";

export const GenericError = () => {
  return (
      <>
        <Title prompt="Error!" />
        <div className="flex items-center justify-center w-full min-h-[80vh] px-4">
          <div className="grid items-center gap-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">
                Oopsie! - It broke.
              </h1>
              <div className="flex items-center justify-center w-full">
                <UwUImage
                    uwuSrc="/uwu/500 InternalServerError.png"
                    alt="500 Error"
                    className="w-1/3"
                />
              </div>
              <p className="max-w-[600px] mx-auto text-accent-foreground md:text-xl/relaxed">
                Oops! Something has broken! You can try to close the tab and
                navigate to the site again!
              </p>
              <p className="text-sm text-accent-foreground">
                Note: This site is still under development. For assistance, join
                our{" "}
                <a
                    className="text-primary"
                    href={import.meta.env.VITE_DISCORD_URL}
                >
                  Discord server
                </a>
                .
              </p>
            </div>
            <div className="flex justify-around space-x-2">
              <Link to="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
              {/* FIXME below line doesn't actually work and I need to get back to revision */}
              <Link search={{}}>
                <Button variant="outline">Reload</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
  );
};
