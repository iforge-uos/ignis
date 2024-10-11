import React from "react";

import { withRef } from "@udecode/cn";
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED, useMediaToolbarButton } from "@udecode/plate-media";

import { Image, Video } from "lucide-react";
import { ToolbarButton } from "./toolbar";

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton ref={ref} {...props} {...rest}>
      {nodeType === ELEMENT_IMAGE ? <Image /> : <Video />}
    </ToolbarButton>
  );
});
