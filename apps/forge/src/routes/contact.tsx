import { HeartspaceIcon, MainspaceIcon } from "@/icons/Locations";
import { DiscordIcon, GitHubIcon, InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from "@/icons/Socials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import type React from "react";
import { TeamIcon } from "@/icons/Team";

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

const locations = [
  {
    name: "iForge Mainspace",
    address: "The Diamond, 32 Leavygreave Rd, Broomhall, Sheffield S3 7RD",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d297.48147569419643!2d-1.4819840000000002!3d53.381701!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4879827f58841ec5%3A0xe3195a4b79f146d6!2siForge%20Makerspace!5e0!3m2!1sen!2suk!4v1744830529840!5m2!1sen!2suk",
    icon: <MainspaceIcon tooltip={false} />,
  },
  {
    name: "iForge Heartspace",
    address: "Engineering Heartspace, 3 Portobello St, Sheffield City Centre, Sheffield S1 4DT",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d194.34675116288207!2d-1.479033377632158!3d53.381706784119764!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487979006229ee6d%3A0xa8a5140013495cc2!2siForge%20Heartspace!5e0!3m2!1sen!2suk!4v1744830589795!5m2!1sen!2suk",
    icon: <HeartspaceIcon tooltip={false} />,
  },
] satisfies {
  name: string;
  address: string;
  mapUrl: string;
  icon: React.ReactNode;
}[];

export function Component() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
          <div className="h-1 w-[40vw] bg-primary mx-auto mt-4 mb-6" />
        </div>
        The iForge is Sheffield University's student-run makerspace, providing access to tools, equipment to turn your
        ideas into reality. Whether you have a question about our facilities, need technical assistance, or want to
        collaborate, we're here to help.
        <section className="mt-4">
          <h2 className="text-2xl font-bold mb-6">General Enquiries</h2>
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
                <div className="flex justify-between gap-4">
                  {socialMediaLinks.map((social, index) => (
                    <SocialLink key={index} {...social} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Specific Enquiries</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamContacts.map((team, index) => (
              <TeamContactCard key={index} {...team} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-6">Our Locations</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {locations.map((location, index) => (
              <LocationCard key={index} {...location} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function LocationCard({ name, address, mapUrl, icon }: (typeof locations)[number]) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{name}</CardTitle>
        </div>
        <CardDescription className="mt-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {address}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="aspect-video w-full">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing location of ${name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TeamContactCard({ icon, team, email, reason }: (typeof teamContacts)[number]) {
  return (
    <Card className="h-full flex flex-col">
      <div className="bg-primary/10 p-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center text-primary rounded-lg">{icon}</div>
        <h3 className="text-lg font-medium">{team}</h3>
      </div>
      <div className="flex flex-col flex-1">
        <CardDescription className="m-4 flex-grow">{reason}</CardDescription>

        <CardContent className="mt-auto pt-3">
          <a
            href={`mailto:${email}`}
            className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
          >
            <Mail className="h-5" />
            {email}
          </a>
        </CardContent>
      </div>
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
