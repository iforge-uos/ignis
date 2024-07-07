import { useTheme } from "@/providers/themeProvider/use-theme";

// n.b does not work if leading char is lowercase because lol
export const IForgeLogo = ({ className }: { className?: string }) => {
  const { normalisedTheme } = useTheme();
  return (
    <img
      src={`${import.meta.env.VITE_CDN_URL}/logos/iforge${normalisedTheme === "dark" ? "-dark" : ""}.png`} // TODO switch to svg
      alt="Logo"
      className={className}
    />
  );
};
