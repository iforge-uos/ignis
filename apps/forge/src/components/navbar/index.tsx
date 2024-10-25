import AppNav from "@/components/navbar/appNav";
import AppSwitcher from "@/components/navbar/appSwitcher";
import { ThemeSwitcher } from "@/components/navbar/themeSwitcher";
import { UserNav } from "@/components/navbar/userNav";
import { getCookie, setCookie } from "@/services/cookies/cookieService";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Menu, X, XIcon } from "lucide-react";
import { useCallback, useState } from "react";

function NotificationBanner() {
  const [dismissed, setDismissed] = useState(getCookie("notification_dismissed") === "true" || false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    // Set the cookie to remember the dismissal
    setCookie("notification_dismissed", "true");
  };

  return (
    <div className="relative w-full">
      <Badge className="h-6 w-full rounded-none flex items-center justify-center text-sm font-medium gap-0.5 overflow-hidden hover:bg-primary">
        The iForge is recruiting!
        <Button
          variant="hyperlink"
          className="text-red-50"
          onClick={() =>
            (document.location =
              "https://docs.google.com/forms/d/e/1FAIpQLSfRTTBDKCd_kZkVLBHW2LI_GHKkYTwyLWcLkqu7E5AemxJKaw/viewform")
          }
        >
          Apply here
        </Button>
        <XIcon className="cursor-pointer" onClick={handleDismiss} />
      </Badge>
    </div>
  );
}

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="sticky top-0 z-40 w-full bg-card text-card-foreground backdrop-filter shadow-lg dark:shadow-none border-b-2">
      <div className="flex items-center h-[60px] px-3 md:px-6">
        <div className="flex items-center flex-1 md:w-1/3 md:flex-none">
          <AppSwitcher onLinkClick={closeMobileMenu} />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center flex-1 md:w-1/3">
          <AppNav />
        </div>

        <div className="flex items-center justify-end flex-1 md:w-1/3 space-x-2 md:space-x-4">
          <ThemeSwitcher />
          <UserNav onLinkClick={closeMobileMenu} />

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <AppNav onLinkClick={closeMobileMenu} />
          </div>
        </div>
      )}
      <NotificationBanner />
    </div>
  );
}
