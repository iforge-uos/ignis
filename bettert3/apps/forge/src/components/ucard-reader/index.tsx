import { activeLocationAtom, sessionAtom } from "@/atoms/signInAppAtoms";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@packages/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UCardReader() {
  const [keysPressed, setKeysPressed] = useState<{ key: string; timestamp: number }[]>([]);
  const [activeLocation] = useAtom(activeLocationAtom);
  const setSession = useSetAtom(sessionAtom);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rep = useUserRoles().includes("rep");

  useEffect(() => {
    if (!rep) {
      return;
    }
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
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
        .slice(0, -1)
        .map(({ key }) => key)
        .join("")
        .match(/\d{9}$/)?.[0];
      if (
        uCardNumber &&
        keysPressed[keysPressed.length - 1].key === "Enter" &&
        keysPressed[keysPressed.length - 1].timestamp - keysPressed[0].timestamp < 10_000
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
                  <a
                    className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
                    href={`/users/${matchingUser.id}`}
                  >
                    {matchingUser.display_name}
                  </a>{" "}
                  would like to sign {action}.
                </div>
                <div>Sign {action} this user?</div>
              </div>
              <Button size={"sm"} onClick={onClick}>
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
                      <a
                        className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
                        href={`/users/${matchingUser.id}`}
                      >
                        {matchingUser.display_name}
                      </a>
                      <br />
                      {(e as any).toString()}
                    </>
                  );
                },
                success: async () => {
                  await queryClient.invalidateQueries({ queryKey: ["locationStatus"] });
                  await queryClient.invalidateQueries({ queryKey: ["locationList", activeLocation] });
                  return (
                    <>
                      Successfully signed out{" "}
                      <a
                        className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
                        href={`/users/${matchingUser.id}`}
                      >
                        {matchingUser.display_name}
                      </a>
                    </>
                  );
                },
              });
            }),
          );
        } else {
          // Replace Redux dispatch with Jotai setSession
          setSession({
            ucard_number: uCardNumber,
            user: matchingUser,
            training: null,
            sign_in_reason: null,
            session_errored: false,
            navigation_is_backtracking: false,
          });

          const t = toast(
            PopUp("in", async () => {
              await navigate({ to: "/sign-in/actions/in-faster" });
              toast.dismiss(t);
            }),
          );
        }
      }
    })();
  }, [keysPressed, activeLocation, setSession, navigate, queryClient]);

  return undefined;
}
