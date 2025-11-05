import { sign_in } from "@packages/db/interfaces";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { MapPin } from "lucide-react";
import type React from "react";
import heartspaceLocationImage from "@/../public/training/heartspace.jpg?lqip";
import mainspaceLocationImage from "@/../public/homepage/ms-front.webp?lqip";
import { HeartspaceIcon, MainspaceIcon } from "@/icons/Locations";

export const locations = {
  MAINSPACE: {
    title: "iForge Mainspace",
    address: "The Diamond, 32 Leavygreave Road, Sheffield, S3 7RD",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d297.48147569419643!2d-1.4819840000000002!3d53.381701!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4879827f58841ec5%3A0xe3195a4b79f146d6!2siForge%20Makerspace!5e0!3m2!1sen!2suk!4v1744830529840!5m2!1sen!2suk",
    icon: <MainspaceIcon tooltip={false} />,
    img: (
      <img
        src={mainspaceLocationImage.src}
        width={mainspaceLocationImage.width}
        height={mainspaceLocationImage.height}
        style={{ backgroundImage: `url("${mainspaceLocationImage.lqip}")`, backgroundSize: "cover" }}
        alt="iForge Mainspace"
        className="h-72 object-cover rounded-md"
      />
    ),
  },
  HEARTSPACE: {
    title: "iForge Heartspace",
    address: "Engineering Heartspace, 3 Portobello Street, Sheffield, S1 4DT",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d194.34675116288207!2d-1.479033377632158!3d53.381706784119764!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487979006229ee6d%3A0xa8a5140013495cc2!2siForge%20Heartspace!5e0!3m2!1sen!2suk!4v1744830589795!5m2!1sen!2suk",
    icon: <HeartspaceIcon tooltip={false} />,
    img: (
      <img
        src={heartspaceLocationImage.src}
        width={heartspaceLocationImage.width}
        height={heartspaceLocationImage.height}
        style={{ backgroundImage: `url("${heartspaceLocationImage.lqip}")`, backgroundSize: "cover" }}
        alt="iForge Heartspace"
        className="h-72 object-cover rounded-md"
      />
    ),
  },
} satisfies Record<
  sign_in.LocationName,
  {
    title: string;
    address: string;
    mapUrl: string;
    icon: React.ReactNode;
    img: React.ReactNode;
  }
>;

type Props = {
  name: sign_in.LocationName;
  children?: React.ReactNode;
  id?: string;
};

export default function LocationCard({ name, id, children }: Props) {
  const {title, address, mapUrl, icon, img,} = locations[name]
  return (
    <Card className="overflow-hidden" id={id}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription className="mt-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {address}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {img}
        {children && <div className="p-4 pt-6 space-y-2">{children}</div>}
        <div className="aspect-video w-full mt-4 rounded-sm">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: "6px" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing location of ${name}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
