import { AppConfig } from "@/types/nav";
import {
  BookIcon,
  BookOpenIcon,
  ClipboardPenIcon,
  EarthIcon,
  FingerprintIcon,
  HouseIcon,
  LayoutDashboardIcon,
  PencilRulerIcon,
  PrinterIcon,
  RssIcon,
  ServerCrashIcon,
  ShieldAlertIcon,
  UserCogIcon,
  ZapIcon,
} from "lucide-react";

export const appConfig: AppConfig[] = [
  {
    name: "Main",
    url: "/",
    logo: HouseIcon,
    description: "",
    mainMenuNavigable: true,
    routes: [
      {
        title: "Home",
        url: "/",
        icon: HouseIcon,
        isActive: true,
      },
    ],
  },
  {
    name: "Sign In",
    url: "/signin/",
    logo: PencilRulerIcon,
    description: "Manage your Sign-In data here.",
    mainMenuNavigable: true,
    routes: [
      {
        title: "Home",
        url: "/signin",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Agreements",
        url: "/signin/agreements",
        icon: ClipboardPenIcon,
        isActive: true,
      },
      {
        title: "Actions",
        icon: ZapIcon,
        isActive: true,
        requiredRoles: ["rep"],
        items: [
          {
            title: "Sign In",
            url: "/signin/actions/in",
          },
          {
            title: "Sign Out",
            url: "/signin/actions/out",
          },
          {
            title: "Enqueue",
            url: "/signin/actions/enqueue",
          },
        ],
        url: "",
      },
      {
        title: "Dashboard",
        url: "/signin/agreements",
        icon: LayoutDashboardIcon,
        isActive: true,
        requiredRoles: ["rep"],
      },
    ],
    navSub: [{ name: "iDocs", url: "https://docs.iforge.sheffield.ac.uk", icon: BookOpenIcon }],
  },
  {
    name: "Training",
    url: "/training",
    logo: BookIcon,
    description: "Do your user training here.",
    mainMenuNavigable: true,
    routes: [
      {
        title: "Home",
        url: "/training",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Locations",
        icon: EarthIcon,
        isActive: true,
        items: [
          {
            title: "Mainspace",
            url: "/training/locations/mainspace",
          },
          {
            title: "Heartspace",
            url: "/training/locations/heartspace",
          },
        ],
        url: "",
      },
      {
        title: "Useful Links",
        icon: RssIcon,
        isActive: true,
        items: [
          {
            title: "Approved Materials",
            url: "/training/approved-materials",
          },
          {
            title: "Risk Assessments",
            url: "/training/risk-assessments",
          },
        ],
        url: "",
      },
    ],
    navSub: [{ name: "iDocs", url: "https://docs.iforge.sheffield.ac.uk", icon: BookOpenIcon }],
  },
  {
    name: "Printing",
    url: "/printing",
    logo: PrinterIcon,
    description: "Manage your 3D Print Jobs here (coming soon)",
    mainMenuNavigable: true,
    routes: [
      {
        title: "Home",
        url: "/printing",
        icon: HouseIcon,
        isActive: true,
      },
    ],
    navSub: [{ name: "iDocs", url: "https://docs.iforge.sheffield.ac.uk", icon: BookOpenIcon }],
  },
  {
    name: "User",
    url: "/signin",
    logo: UserCogIcon,
    description: "Manage your user details here",
    mainMenuNavigable: false,
    routes: [
      {
        title: "Home",
        url: "/user",
        icon: HouseIcon,
        isActive: true,
      },
    ],
    navSub: [{ name: "iDocs", url: "https://docs.iforge.sheffield.ac.uk", icon: BookOpenIcon }],
  },
  {
    name: "Admin",
    url: "/admin",
    logo: ShieldAlertIcon,
    description: "Administer the iForge",
    mainMenuNavigable: true,
    requiredRoles: ["admin"],
    routes: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Agreements",
        url: "/admin/agreements",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Notifications",
        icon: HouseIcon,
        url: "/admin/notifications/dashboard",
        isActive: true,
        items: [
          {
            title: "Emails",
            url: "/admin/notifications/email",
          },
          {
            title: "App Notifications",
            url: "/admin/notifications/app",
          },
          {
            title: "Discord",
            url: "/admin/notifications/discord",
          },
        ],
      },
      {
        title: "Reps",
        url: "/admin/reps",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Teams",
        url: "/admin/teams",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: HouseIcon,
        isActive: true,
      },
      {
        title: "Training",
        url: "/admin/training",
        icon: HouseIcon,
        isActive: true,
      },
    ],
    navSub: [{ name: "iDocs", url: "https://docs.iforge.sheffield.ac.uk", icon: BookOpenIcon }],
  },
  {
    name: "Auth",
    url: "/auth",
    logo: FingerprintIcon,
    description: "Authenticate with the iForge",
    mainMenuNavigable: false,
    routes: [],
    navSub: [{ name: "iDocs", url: "https://docs.iforge.sheffield.ac.uk", icon: BookOpenIcon }],
  },
  {
    name: "Error",
    url: "",
    logo: ServerCrashIcon,
    description: "Oh no!",
    mainMenuNavigable: false,
    routes: [],
  },
  {
    name: "Socials",
    url: "/socials",
    logo: RssIcon,
    description: "iForge Social Media Profiles",
    mainMenuNavigable: false,
    routes: [
      {
        title: "Home",
        url: "/socials",
        icon: HouseIcon,
        isActive: true,
      },
    ],
  },
];
