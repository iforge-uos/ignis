import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import type React from "react";

import LocationCard, { locations } from "@/components/LocationCard";
import { DiscordIcon, GitHubIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "@/icons/Socials";
import { TeamIcon } from "@/icons/Team";
import { LOCATIONS } from "../lib/constants";
import Title from "../components/title";

const socialMediaLinks = [
  {
    name: "Instagram",
    icon: <InstagramIcon />,
  },
  {
    name: "YouTube",
    icon: <YouTubeIcon />,
  },
  {
    name: "Twitter",
    icon: <TwitterIcon />,
  },
  {
    name: "LinkedIn",
    icon: <LinkedInIcon />,
  },
  {
    name: "GitHub",
    icon: <GitHubIcon />,
  },
  {
    name: "Discord",
    icon: <DiscordIcon />,
  },
] satisfies {
  name: string;
  icon: React.ReactNode;
}[];

const teamContacts = [
  {
    team: "Publicity",
    email: "publicity.iforge@sheffield.ac.uk",
    icon: <TeamIcon team="Publicity" />,
    reason: `Contact our Publicity team for questions about the iForge's brand, media features, social media presence, or promotional materials. They manage our public image through photography, graphic design and content creation.`,
  },
  {
    team: "Relations",
    email: "relations.iforge@sheffield.ac.uk",
    icon: <TeamIcon team="Relations" />,
    reason:
      "Contact our Relations team for partnership enquiries, sponsorship opportunities, or to discuss collaboration between the iForge and your organisation. They manage our external relationships and help expand our impact within the university and beyond.",
  },
  {
    team: "Events",
    email: "events.iforge@sheffield.ac.uk",
    icon: <TeamIcon team="Events" />,
    reason:
      "Contact our Events team to collaborate on workshops, demonstrations or special projects. They organise activities showcasing our makerspace capabilities and can provide information about hosting events with the iForge for societies, departments or external organisations.",
  },
  {
    team: "Hardware",
    email: "hardware.iforge@sheffield.ac.uk",
    icon: <TeamIcon team="Hardware" />,
    reason:
      "Contact our Hardware team for questions about equipment (excluding 3D printers), technical assistance with machinery, or advice on projects requiring our workshop facilities. They ensure all equipment is maintained, functional and safe to use.",
  },
  {
    team: "3D Printing",
    email: "3dprinting.iforge@sheffield.ac.uk",
    icon: <TeamIcon team="3DP" />,
    reason: `Contact our 3D Printing team for advice on preparing designs for 3D printing, selecting appropriate materials, or questions about our printer capabilities. They manage all aspects of the iForge's free 3D printing service.`,
  },
] satisfies {
  team: string;
  email: string;
  icon: React.ReactNode;
  reason: string;
}[];

export function Component() {
  return (
    <>
      <Title prompt="Contact Us" />
      <div className="py-8 px-14">
        <h1 className="text-5xl font-futura mb-4">Contact Us</h1>
        <p className="text-lg">
          The iForge is Sheffield University's student-run makerspace, providing access to tools, equipment to turn your
          ideas into reality. Whether you have a question about our facilities, need technical assistance, or want to
          collaborate, we're here to help.
        </p>
        <section className="mt-4">
          <h2 className="text-3xl font-bold mb-6">General Enquiries</h2>
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Reach out to us via email or connect with us on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email</h3>
                <a
                  href="mailto:iforge@sheffield.ac.uk"
                  className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-3 text-base transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  iforge@sheffield.ac.uk
                </a>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media</h3>
                <div className="flex flex-wrap justify-between gap-4">
                  {socialMediaLinks.map((social, index) => (
                    <SocialLink key={index} {...social} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-bold my-6">Specific Enquiries</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamContacts.map((team, index) => (
              <TeamContactCard key={index} {...team} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold my-6">Our Locations</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {LOCATIONS.map((location, index) => (
              <LocationCard name={location} key={index} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function TeamContactCard({ icon, team, email, reason }: (typeof teamContacts)[number]) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center text-primary rounded-lg">{icon}</div>
          <h3 className="text-lg font-medium">{team}</h3>
        </CardTitle>
        <CardDescription className="m-4 flex-grow">{reason}</CardDescription>
      </CardHeader>

      <CardContent className="mt-auto px-9">
        <a
          href={`mailto:${email}`}
          className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
        >
          <Mail className="h-5" />
          {email}
        </a>
      </CardContent>
    </Card>
  );
}

function SocialLink({ icon, name }: (typeof socialMediaLinks)[number]) {
  return (
    <div className="flex flex-col items-center gap-2">
      {icon}
      <span className="text-xs text-center">{name}</span>
      {/* </Link> */}
    </div>
  );
}

export const Route = createFileRoute("/contact")({
  component: Component,
});
