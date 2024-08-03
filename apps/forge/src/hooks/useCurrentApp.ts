import { Apps } from "@/types/app.ts";
import { useMatches, useParentMatches } from "@tanstack/react-router";

const useCurrentApp = (): Apps | undefined => {
  const parent = useParentMatches();
  const matchWithTitle = useMatches()
    .reverse()
    .find((d) => d.staticData?.title);

  if (!matchWithTitle) {
    if (parent.length === 0) {
      return "Error"; // not found
    }
    console.error("No match with title found", parent);
    throw new Error("Page has no title. This should have been set in the root directory in a file with the app's name");
  }

  return matchWithTitle.staticData.title;
};

export default useCurrentApp;
