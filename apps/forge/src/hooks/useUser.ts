import { Route } from "../routes/__root";

export const useUser = () => {
  const { user } = Route.useRouteContext();
  return user;
};
