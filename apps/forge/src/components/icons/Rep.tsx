import { IconProps } from "@radix-ui/react-icons/dist/types";
import { Icon, IconNode } from "lucide-react";

const rep: IconNode = [
  [
    "svg",
    {
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      version: "1.1",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      className: "lucide lucide-rep",
    },
  ],
  [
    "path",
    {
      d: "M14.96 6.986s.134 3.565 1.973 4.69v10.32M9.044 6.987s-.138 3.564-1.977 4.689v10.32M9.044 6.987l5.916-.001m1.973 15.01H7.067",
      strokeWidth: "2",
    },
  ],
  [
    "path",
    {
      d: "M10 6.999c0-1.77-.058-4.997 2-4.997m1.998 4.997c0-1.77.058-4.997-2-4.997",
      strokeWidth: "2",
    },
  ],
  [
    "path",
    {
      d: "M13.871 17.401s-.067 1.249-.497 1.387c-.264.085-1.374.074-1.374.074m-1.871-1.461s.067 1.249.497 1.387c.264.085 1.374.074 1.374.074m1.871-1.461h-3.742",
      strokeWidth: "2",
    },
  ],
  [
    "path",
    {
      d: "M7.067 15c-1.93 0-2.364.716-2.364 1.601 0 1.282-.39 5.395-1.696 5.395",
      strokeWidth: "2",
      transform: "matrix(.94384 0 0 1.00974 .169 -.214)",
    },
  ],
  [
    "path",
    {
      d: "M7.067 15c-1.93 0-2.364.716-2.364 1.601 0 1.282-.39 5.395-1.696 5.395",
      strokeWidth: "2",
      transform: "matrix(-.94384 0 0 1.00974 23.841 -.214)",
    },
  ],
];

export const Rep = (props: IconProps) => <Icon iconNode={rep} {...props} />;
export { Rep as RepIcon };
export default Rep;
