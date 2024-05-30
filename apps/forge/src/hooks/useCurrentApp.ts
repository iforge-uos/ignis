import { Apps } from "@/types/app.ts";
import { useMatches } from "@tanstack/react-router";

const useCurrentApp = (): Apps | undefined => {
  console.log("useCurrentApp hook called");

  const matches = useMatches();
  console.log("useMatches result:", matches);

  const matchWithTitle = matches
      .reverse()
      .find((d) => {
        console.log("Checking match:", d);
        return d.staticData?.title;
      });

  if (!matchWithTitle) {
    console.error("No match with title found");
    throw new Error("Page has no title. This should have been set in the root directory in a file with the app's name");
  }

  const title = matchWithTitle.staticData.title;
  console.log("Found title:", title);

  return matchWithTitle.staticData.title;
};

export default useCurrentApp;
