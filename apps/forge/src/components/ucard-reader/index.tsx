import { activeLocationAtom, sessionAtom } from "@/atoms/signInAppAtoms";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@packages/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { orpc } from "/src/lib/orpc";

export default function UCardReader() {
  const [keysPressed, setKeysPressed] = useState<{ key: string; timestamp: number }[]>([]);
  const activeLocation = useAtomValue(activeLocationAtom);
  const navigate = useNavigate();
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
      const ucard_number = keysPressed
        .slice(0, -1)
        .map(({ key }) => key)
        .join("")
        .match(/\d{9}$/)?.[0];
      if (
        ucard_number &&
        keysPressed[keysPressed.length - 1].key === "Enter" &&
        keysPressed[keysPressed.length - 1].timestamp - keysPressed[0].timestamp < 10_000
      ) {
        const matchingUser = await orpc.locations.signIn.user.call({ ucard_number, name: activeLocation });
        if (!matchingUser) return;

        const PopUp = (action: string, onClick: () => Promise<any>) => {
          return (
            <div className="flex justify-between items-center">
              <div>
                <div className="pr-3 text-m">
                  <Link
                    className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
                    to="/users/$id"
                    params={matchingUser}
                  >
                    {matchingUser.display_name}
                  </Link>{" "}
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

        if (matchingUser.location) {
          const t = toast(
            PopUp("out", async () => {
              toast.promise(orpc.locations.signIns.out.call({ ucard_number, name: activeLocation }), {
                id: t,
                loading: "Loading...",
                error: (e) => {
                  return (
                    <>
                      <Link
                        className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
                        to={`/users/$id`}
                        params={matchingUser}
                      >
                        {matchingUser.display_name}
                      </Link>
                      <br />
                      {(e as any).toString()}
                    </>
                  );
                },
                success: async () => {
                  return (
                    <>
                      Successfully signed out{" "}
                      <Link
                        className="font-bold hover:underline underline-offset-4 hover:cursor-pointer"
                        to="/users/$id"
                        params={matchingUser}
                      >
                        {matchingUser.display_name}
                      </Link>
                    </>
                  );
                },
              });
            }),
          );
        } else {
          const t = toast(
            PopUp("in", async () => {
              await navigate({
                to: "/sign-in/$location/$ucard_number",
                params: { location: activeLocation, ucard_number: ucard_number as any },
              });
              toast.dismiss(t);
            }),
          );
        }
      }
    })();
  }, [keysPressed, activeLocation, navigate]);

  return undefined;
}
