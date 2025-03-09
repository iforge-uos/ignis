import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@ignis/ui/components/ui/button";
import { Alert, AlertDescription } from "@ignis/ui/components/ui/alert";
import { getCookie, setCookie } from "@/services/cookies/cookieService.ts";

export default function NavAdvertisementBanner() {
  const [dismissed, setDismissed] = useState(getCookie("notification_dismissed") === "true");
  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    setCookie("notification_dismissed", "true");
  };

  return (
    <Alert variant="default" className="relative border-0 rounded-sm bg-primary min-h-[32px] py-0">
      <div className="flex items-center justify-between h-8">
        <AlertDescription className="text-sm font-medium text-primary-foreground">
          The iForge is recruiting!
        </AlertDescription>
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-primary-foreground/10 text-primary-foreground underline-offset-2 underline"
            onClick={() => {
              window.open(
                "https://docs.google.com/forms/d/e/1FAIpQLSfRTTBDKCd_kZkVLBHW2LI_GHKkYTwyLWcLkqu7E5AemxJKaw/viewform",
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            Apply here
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary-foreground/10"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3 text-primary-foreground" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </Alert>
  );
}
