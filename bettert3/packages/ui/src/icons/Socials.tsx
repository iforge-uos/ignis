import { Button } from "@packages/ui/components/button";
import React from "react";

type Formats = "svg" | "png";

const SocialIcon = ({
  icon,
  altText,
  href,
  format = "svg",
  Comp = Button,
}: {
  icon: string;
  altText: string;
  href: string;
  format?: Formats;
  Comp?: React.ElementType;
}) => {
  return (
    <a href={href}>
      <Comp variant="outline" size="icon">
        <img
          src={`${(import.meta as any).env?.VITE_CDN_URL || process.env.CDN_URL}/icons/${icon}.${format}`}
          className="dark:invert h-6"
          alt={altText}
        />
      </Comp>
    </a>
  );
};

export const GitHubIcon = ({ Comp = Button, format = "svg" }: { Comp?: React.ElementType; format?: Formats }) => (
  <SocialIcon icon="github" altText="GitHub" href="https://github.com/iforge-uos" Comp={Comp} format={format} />
);

export const DiscordIcon = ({ Comp = Button, format = "svg" }: { Comp?: React.ElementType; format?: Formats }) => (
  <SocialIcon icon="discord" altText="Discord" href="https://discord.gg/UK6e8GeArH" Comp={Comp} format={format} />
);

export const InstagramIcon = ({ Comp = Button, format = "svg" }: { Comp?: React.ElementType; format?: Formats }) => (
  <SocialIcon
    icon="instagram"
    altText="Instagram"
    href="https://instagram.com/iforge_uos"
    Comp={Comp}
    format={format}
  />
);

export const LinkedInIcon = ({ Comp = Button, format = "svg" }: { Comp?: React.ElementType; format?: Formats }) => (
  <SocialIcon
    icon="linkedin"
    altText="LinkedIn"
    href="https://www.linkedin.com/company/iforge"
    Comp={Comp}
    format={format}
  />
);

export const TwitterIcon = ({ Comp = Button, format = "svg" }: { Comp?: React.ElementType; format?: Formats }) => (
  <SocialIcon icon="twitter" altText="Twitter" href="https://twitter.com/iForgeUoS" Comp={Comp} format={format} />
);

export const YouTubeIcon = ({ Comp = Button, format = "svg" }: { Comp?: React.ElementType; format?: Formats }) => (
  <SocialIcon icon="youtube" altText="YouTube" href="https://www.youtube.com/@iforge_uos" Comp={Comp} format={format} />
);
