import { Tool, ToolGroup } from "@/components/sign-in/FloorPlan/types";
import { exhaustiveGuard } from "@/lib/utils";

/** "CNC-Router" -> "CNC Router", "_3D-Printer" -> "3D Printer". */
export function svgIdToLabel(id: string) {
  return id.replace(/^_/, "").replace(/[-_]+/g, " ").trim();
}

/** Prefer serif:id (Inkscape human label), fall back to converted id. */
export function getGroupDisplayName(el: Element): string {
  return el.getAttribute("serif:id") || svgIdToLabel(el.id);
}

/** Normalise for name-matching: lowercase, keep alphanumeric + spaces only. */
export function normaliseName(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Walk named groups under g#Tools and flatten one level of compound groups.
 */
export function parseToolsFromSVG(svg: Element): Array<{ svgId: string; displayName: string }> {
  const toolsGroup =
    svg.querySelector('[id="Tools"]') ??
    svg
      .querySelectorAll("g[id]")
      .values()
      .find((el) => el.id === "Tools");
  if (!toolsGroup) return [];

  const result: { svgId: string; displayName: string }[] = [];

  for (const child of toolsGroup.children) {
    if (child.localName !== "g" || !child.id) continue;

    const namedChildren = Array.from(child.children).filter(
      (el): el is Element => el.localName === "g" && Boolean(el.id) && !/^laptop/i.test(getGroupDisplayName(el)),
    );

    if (namedChildren.length > 0) {
      for (const sub of namedChildren) {
        result.push({ svgId: sub.id, displayName: getGroupDisplayName(sub) });
      }
    } else {
      result.push({ svgId: child.id, displayName: getGroupDisplayName(child) });
    }
  }

  return result;
}

/** Try to find a matching tool entry by normalised display name. */
export function matchTool(displayName: string, tools: Tool[] | undefined) {
  if (!tools?.length) return null;
  const norm = normaliseName(displayName);
  return tools.find((tool) => normaliseName(tool.name) === norm) ?? null;
}

export function getToolQuantity(toolInventory: Tool[] | undefined, toolName: string) {
  return toolInventory?.find((tool) => tool.name === toolName)?.quantity ?? 1;
}

export function getToolState(use_count: number | null, quantity: number): ToolGroup["state"] {
  if (use_count === null) return "restricted";
  if (use_count === 0) return "available";
  if (use_count >= quantity) return "active";
  return "partial";
}

export function stateBadgeVariant(state: ToolGroup["state"]) {
  switch (state) {
    case "available":
      return "success";
    case "partial":
      return "warning";
    case "active":
      return "destructive";
    case "restricted":
      return "outline";
    default:
      exhaustiveGuard(state);
  }
}

export function stateLabel(tool: ToolGroup) {
  if (tool.use_count === null) return `${tool.quantity} total`;
  if (tool.borrowable === false) return `${tool.use_count} signed in`;
  if (!tool.name) return "Always available";
  if (tool.quantity === 1) {
    if (tool.use_count >= 1) return "in use";
    return "not in use";
  }
  return `${tool.use_count}/${tool.quantity} in use`;
}