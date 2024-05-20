import { useUser } from "@/lib/utils";
import { signinActions } from "@/redux/signin.slice";
import { AppDispatch, AppRootState } from "@/redux/store";
import { GetSignIn, PostSignOut } from "@/services/signin/signInService";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function UCardReader() {
  const [keysPressed, setKeysPressed] = useState<{ key: string; timestamp: number }[]>([]);
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUser();
  const rep = user?.roles.some((role) => role.name === "Rep");

  useEffect(() => {
    if (!rep) {
      return;
    }
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        // TODO capture the input if a ucard is detected. This should be possible assuming the card reader is fast af
        // (more than 50ms for full entry though that's assuming display input is instant if we factor that in it should be about 0.0333s)
        // Don't capture key presses when the target is an input field
        return;
      }
      setKeysPressed((prevKeys) => [...prevKeys, { key: e.key, timestamp: Date.now() }].slice(-10));
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [rep]);

  useEffect(() => {
    (async () => {
      const uCardNumber = keysPressed
        .slice(0, -1) // Exclude the last key press
        .map(({ key }) => key)
        .join("")
        .match(/\d{9}$/)?.[0];
      if (
        uCardNumber &&
        keysPressed[keysPressed.length - 1].key === "Enter" && // Last key press is "Enter"
        keysPressed[keysPressed.length - 1].timestamp - keysPressed[0].timestamp < 10_000 // All entered in 10ms
      ) {
        const userProps = {
          uCardNumber,
          locationName: activeLocation,
          signal: undefined as any,
          params: { fast: true },
        };
        const matchingUser = await GetSignIn(userProps);

        const PopUp = (action: string, onClick: () => Promise<any>) => {
          return (
            <div className="flex justify-between items-center">
              <div>
                <div className="pr-3 text-m">
                  {/* <Link
                      className="font-bold hover:underline hover:cursor-pointer"
                     to="/users/$id"
                     params={matchingUser}
                  */}
                  <a className="font-bold hover:underline hover:cursor-pointer" href={`/users/${matchingUser.id}`}>
                    {matchingUser.display_name}
                  </a>{" "}
                  would like to sign {action}.
                </div>
                <div>Sign {action} this user?</div>
              </div>
              <Button size={"sm"} onClick={() => onClick()}>
                Yes
              </Button>
            </div>
          );
        };

        if (matchingUser.signed_in) {
          const t = toast(
            PopUp("out", async () => {
              toast.promise(PostSignOut(userProps), {
                id: t,
                loading: "Loading...",
                error: (e) => {
                  return (
                    <>
                      <a className="font-bold hover:underline hover:cursor-pointer" href={`/users/${matchingUser.id}`}>
                        {matchingUser.display_name}
                      </a>
                      <br />
                      {(e as any).toString()}
                    </>
                  );
                },
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["locationStatus", "locationList", { activeLocation }] });
                  return `Successfully signed out ${uCardNumber}`;
                },
              });
            }),
          );
        } else {
          dispatch(
            signinActions.setSignInSession({
              ucard_number: uCardNumber,
              user: matchingUser,
              training: null,
              sign_in_reason: null,
              session_errored: false,
              navigation_is_backtracking: false,
            }),
          );
          const t = toast(
            PopUp("in", async () => {
              navigate({ to: "/signin/actions/in-faster" });
              toast.dismiss(t); // auto-dismiss to avoid invalid state if the user re-clicks
            }),
          );
        }
      }
    })();
  }, [keysPressed, activeLocation]);

  return undefined;
}
