import { AppRootState } from "@/redux/store";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "@ui/components/ui/loader.tsx";
import { useVerifyAuthentication } from "@/hooks/useVerifyAuthentication.ts";
import { userActions } from "@/redux/user.slice.ts";

export const CompleteComponent = () => {
  const { user, loading } = useVerifyAuthentication();
  const dispatch = useDispatch();
  const redirect = useSelector((state: AppRootState) => state.auth.redirect) || "/";

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace={true} />;
  }

  dispatch(userActions.setUser(user));

  return <Navigate to={redirect} replace={true} />;
};

export const Route = createFileRoute("/auth/login/complete")({
  component: CompleteComponent,
});
