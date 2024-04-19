import { useState, useEffect } from "react";
import { useMatchRoute, useRouterState } from "@tanstack/react-router";
import { Apps } from "@/types/app.ts";
import { appRoutes } from "@/types/common.ts";
import { appNavMapping } from "@/config/nav.ts";

const useCurrentApp = (): Apps | undefined => {
  const [currentApp, setCurrentApp] = useState<Apps | undefined>(undefined);
  const matchRoute = useMatchRoute();

  const routerChanged = useRouterState().resolvedLocation.pathname;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Needed to include router state or else this doesn't update quick enough (side effect is it updates too much)>
  useEffect(() => {
    for (const [routeSegment, app] of Object.entries(appNavMapping)) {
      const route = routeSegment as appRoutes;
      const match = matchRoute({ to: `/${route}`, fuzzy: true });
      if (match) {
        console.log("updating");
        setCurrentApp(app);
        return; // Stop the loop once a match is found
      }
    }
  }, [matchRoute, routerChanged]);

  return currentApp;
};

export default useCurrentApp;
