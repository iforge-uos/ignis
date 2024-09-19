import { Button } from "@ui/components/ui/button";

const SocialIcon = ({ icon, altText, href }: { icon: string; altText: string; href: string }) => {
  return (
    <a href={href}>
      <Button variant="outline" size="icon">
        <img src={`${import.meta.env.VITE_CDN_URL}/icons/${icon}.svg`} className="dark:invert h-6" alt={altText} />
      </Button>
    </a>
  );
};

export const GitHubIcon = () => <SocialIcon icon="github" altText="GitHub" href="https://github.com/iforge-uos" />;

export const DiscordIcon = () => <SocialIcon icon="discord" altText="Discord" href="https://discord.gg/UK6e8GeArH" />;

export const InstagramIcon = () => (
  <SocialIcon icon="instagram" altText="Instagram" href="https://instagram.com/iforge_uos" />
);

export const LinkedInIcon = () => (
  <SocialIcon icon="linkedin" altText="LinkedIn" href="https://www.linkedin.com/company/iforge" />
);

export const TwitterIcon = () => <SocialIcon icon="twitter" altText="Twitter" href="https://twitter.com/iForgeUoS" />;

export const YouTubeIcon = () => (
  <SocialIcon icon="youtube" altText="YouTube" href="https://www.youtube.com/@iforge_uos" />
);
