import type { LocationName } from "@packages/types/sign_in";
import type { Procedures } from "@/types/router";

export type Tool = Procedures["locations"]["tools"]["all"][number];

// A tool group discovered from the SVG, with optional tool-list data merged in.
export interface ToolGroup extends Partial<Omit<Tool, "name">> {
  svgId: string;
  displayName: string;
  quantity: number;
  name: string | null; // null when SVG group has no matching tool
  state: "available" | "partial" | "active" | "restricted";
}

export type FloorPlanProps = {
  /** Raw SVG markup. Preferred when DOM ids/groups must be preserved exactly. */
  svgMarkup?: string;
  /** Width the SVG should be rendered at (height auto-scales). */
  svgWidth?: number;
  locationName: LocationName;
  tools?: Tool[];
  className?: string;
};
