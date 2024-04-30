import { signinActions } from "@/redux/signin.slice";
import { AppDispatch, AppRootState } from "@/redux/store";
import { GetSignIn, PostSignOut } from "@/services/signin/signInService";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function UCardReader() {
  const [keysPressed, setKeysPressed] = useState<{ key: string; timestamp: number }[]>([]);
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

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
        const userProps = { uCardNumber, locationName: activeLocation, signal: undefined as any };
        const matchingUser = await GetSignIn(userProps);

        if (matchingUser.signed_in) {
          toast(`User ${uCardNumber} would like to sign out`, {
            description: "Sign out this user?",
            action: {
              label: "Yes",
              onClick: () => {
                (async () => {
                  try {
                    await PostSignOut(userProps);
                  } catch (e) {
                    toast.error(`Failed to sign out user ${uCardNumber}`, { description: (e as any).toString() });
                  }
                })();
              },
            },
          });
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
          toast(`User ${uCardNumber} would like to sign in`, {
            description: "Sign in this user?",
            action: {
              label: "Go to sign in",
              onClick: () => {
                navigate({ to: "/signin/actions/in-faster" });
              },
            },
          });
        }
      }
    })();
  }, [keysPressed, activeLocation]);
  return undefined;
}
