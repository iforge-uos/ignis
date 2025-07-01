import { IconProps } from "@radix-ui/react-icons/dist/types";
import { Icon, IconNode } from "lucide-react";

const noRep: IconNode = [
  [
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      xmlSpace: "preserve",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      version: "1.1",
      viewBox: "0 0 24 24",
      className: "lucide lucide-rep",
    },
  ],
  [
    "path",
    {
      d: "M10.147 4.24c.205-1.212.692-2.238 1.853-2.238m1.998 4.997c0-1.77.058-4.997-2-4.997M10.13 4.346l.017-.106m-.039.255.022-.149",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
    },
  ],
  [
    "path",
    {
      d: "M7.067 12.951v9.045m5.899-15.009 1.994-.001m.987 15.01h-8.88m7.893-15.01s.06 1.596.65 2.989l.037.085",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.99",
      transform: "matrix(1.01422 0 0 .99913 -.173 .02)",
    },
  ],
  [
    "path",
    {
      d: "M13.871 17.401s-.067 1.249-.497 1.387c-.264.085-1.374.074-1.374.074m-1.871-1.461s.067 1.249.497 1.387c.264.085 1.374.074 1.374.074m1.871-1.461h-3.742",
      stroke: "currentColor",
      strokeWidth: "2",
    },
  ],
  [
    "path",
    {
      d: "M7.067 15c-1.93 0-2.364.716-2.364 1.601 0 1.282-.39 5.395-1.696 5.395",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      transform: "matrix(.94384 0 0 1.00974 .169 -.214)",
    },
  ],
  [
    "path",
    {
      d: "m1.093 1.093 21.813 21.813",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.18",
      transform: "translate(1 1) scale(.91661)",
    },
  ],
];

export const NoRep = (props: IconProps) => <Icon iconNode={noRep} {...props} />;
export { NoRep as NoRepIcon };
export default NoRep;
