import { AppRootState } from "@/redux/store";
import { GetSignIn } from "@/services/signin/signInService";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function UCardReader() {
  const [keysPressed, setKeysPressed] = useState<{ key: string; timestamp: number }[]>([]);
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
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
        .match(/\d{6}$/)?.[0];
      if (
        uCardNumber &&
        keysPressed[keysPressed.length - 1].key === "Enter" && // Last key press is "Enter"
        keysPressed[keysPressed.length - 1].timestamp - keysPressed[0].timestamp < 10 // All entered in 10ms
      ) {
        const matchingUser = await GetSignIn({ uCardNumber, locationName: activeLocation, signal: undefined as any });
        if (matchingUser) {
          toast(`Read ${uCardNumber}`, {
            description: "Logout this user?",
            action: {
              label: "Yes",
              onClick: () => console.log("Clicked"),
            },
          });
        } else {
          toast(`Read ${uCardNumber}`, {
            description: "Login this user?",
            action: {
              label: "Yes",
              onClick: () => console.log("Clicked"),
            },
          });
        }
      }
    })();
  }, [keysPressed, activeLocation]);
}
