import type { JsxEmailComponent, LinkProps } from "jsx-email";
import * as React from "react";

export const Link: JsxEmailComponent<LinkProps> = ({ disableDefaultStyle, style, target, ...props }) => (
  <a
    {...props}
    data-id="jsx-email/link"
    target={target}
    style={{
      ...(disableDefaultStyle ? {} : { textDecoration: "none" }), // we use iForge orange in the style sheet
      ...style,
    }}
  />
);

Link.displayName = "Link";
