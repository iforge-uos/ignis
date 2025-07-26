import { Button } from "@packages/ui/components/button";
import React from "react";

import { default as DiscordSvg } from "@/../public/icons/discord.svg?react";
import { default as GitHubSvg } from "@/../public/icons/github.svg?react";
import { default as InstagramSvg } from "@/../public/icons/instagram.svg?react";
import { default as LinkedInSvg } from "@/../public/icons/linkedin.svg?react";
import { default as TwitterSvg } from "@/../public/icons/twitter.svg?react";
import { default as YouTubeSvg } from "@/../public/icons/youtube.svg?react";

const SocialIcon = ({
  Icon,
  altText,
  href,
  Comp = Button,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  altText: string;
  href: string;
  Comp?: React.ElementType;
}) => {
  return (
    <a href={href} aria-label={altText}>
      {/* I don't understand css anymore */}
      <Comp variant="outline" className="w-10 h-10 px-0 hover:cursor-pointer">
        {/* width and height make things very funny */}
        <Icon className="dark:invert w-6 h-6" width={undefined} height={undefined} />
      </Comp>
    </a>
  );
};

export const GitHubIcon = ({ Comp = Button }: { Comp?: React.ElementType }) => (
  <SocialIcon Icon={GitHubSvg} altText="GitHub" href="https://github.com/iforge-uos" Comp={Comp} />
);

export const DiscordIcon = ({ Comp = Button }: { Comp?: React.ElementType }) => (
  <SocialIcon Icon={DiscordSvg} altText="Discord" href="https://discord.gg/UK6e8GeArH" Comp={Comp} />
);

export const InstagramIcon = ({ Comp = Button }: { Comp?: React.ElementType }) => (
  <SocialIcon Icon={InstagramSvg} altText="Instagram" href="https://instagram.com/iforge_uos" Comp={Comp} />
);

export const LinkedInIcon = ({ Comp = Button }: { Comp?: React.ElementType }) => (
  <SocialIcon Icon={LinkedInSvg} altText="LinkedIn" href="https://www.linkedin.com/company/iforge" Comp={Comp} />
);

export const TwitterIcon = ({ Comp = Button }: { Comp?: React.ElementType }) => (
  <SocialIcon Icon={TwitterSvg} altText="Twitter" href="https://twitter.com/iForgeUoS" Comp={Comp} />
);

export const YouTubeIcon = ({ Comp = Button }: { Comp?: React.ElementType }) => (
  <SocialIcon Icon={YouTubeSvg} altText="YouTube" href="https://www.youtube.com/@iforge_uos" Comp={Comp} />
);
