import { Apps } from "@/types/app.ts";
import { useMatches } from "@tanstack/react-router";

const useCurrentApp = (): Apps | undefined => {
  const matchWithTitle = useMatches()
    .reverse()
    .find((d) => d.staticData.title);

  const title = matchWithTitle?.staticData.title;
  if (!title) {
    throw new Error("Page has no title. This should have been set in the root directory in a file with the app's name");
  }
  return title;
};

export default useCurrentApp;
