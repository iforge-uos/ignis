import { EXTRA_TOOLTIP_REGIONS, TOOL_HITBOX_PADDING } from "@/lib/constants";
import { stateLabel } from "@/lib/utils/tools";
import type { ToolGroup } from "./types";

export function applyToolStyles(svg: SVGElement, toolGroups: ToolGroup[], selectedId: string | null) {
  const drawableTags = new Set(["path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "use"]);
  const drawableSelector = Array.from(drawableTags).join(",");

  const applyPaddedHitboxes = (container: SVGElement, mappedId: string) => {
    const hitTargets: SVGGraphicsElement[] = [];

    if (
      container instanceof SVGGraphicsElement &&
      drawableTags.has(container.localName) &&
      container.dataset.toolHitbox !== "true"
    ) {
      hitTargets.push(container);
    }

    hitTargets.push(
      ...container.querySelectorAll<SVGGraphicsElement>(drawableSelector).values().filter(
        (target) => target.dataset.toolHitbox !== "true",
      ).toArray(),
    );

    for (const target of hitTargets) {
      try {
        const bbox = target.getBBox();
        if (bbox.width <= 0 || bbox.height <= 0) continue;
        const parent = target.parentElement;
        if (!parent) continue;

        const hitbox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        hitbox.setAttribute("data-tool-hitbox", "true");
        hitbox.setAttribute("data-tool-hitbox-for", mappedId);
        hitbox.setAttribute("x", String(bbox.x - TOOL_HITBOX_PADDING));
        hitbox.setAttribute("y", String(bbox.y - TOOL_HITBOX_PADDING));
        hitbox.setAttribute("width", String(bbox.width + TOOL_HITBOX_PADDING * 2));
        hitbox.setAttribute("height", String(bbox.height + TOOL_HITBOX_PADDING * 2));
        hitbox.setAttribute("fill", "rgba(0,0,0,0)");
        hitbox.setAttribute("stroke", "none");
        hitbox.setAttribute("pointer-events", "all");
        parent.append(hitbox);
      } catch {
        // Some SVG nodes can fail BBox computation; skip them.
      }
    }
  };

  for (const el of svg.querySelectorAll("rect[data-tool-hitbox='true']")) {
    el.remove();
  }

  for (const node of svg.querySelectorAll<SVGGraphicsElement>("[data-tool-state]")) {
    delete node.dataset.toolState;
    delete node.dataset.toolSelected;
    node.querySelector(":scope > title[data-tool-title='true']")?.remove();
  }

  for (const tool of toolGroups) {
    const el = svg.querySelector<SVGGraphicsElement>(`[id="${CSS.escape(tool.svgId)}"]`);
    if (!el) continue;

    el.dataset.toolState = tool.state;

    if (selectedId === tool.svgId) {
      el.dataset.toolSelected = "true";
    }

    applyPaddedHitboxes(el, tool.svgId);

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.setAttribute("data-tool-title", "true");
    title.textContent = tool.name ? `${tool.displayName}: ${stateLabel(tool)}` : tool.displayName;
    el.prepend(title);
  }

  for (const svgId of EXTRA_TOOLTIP_REGIONS) {
    const el = svg.querySelector<SVGElement>(`[id="${CSS.escape(svgId)}"]`);
    if (!el) continue;
    applyPaddedHitboxes(el, svgId);
  }
}
