// Styled in global.css
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { MapPinned, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { EXTRA_TOOLTIP_REGIONS, STATE_COLOUR_GUIDE } from "@/lib/constants";
import { getToolQuantity, getToolState, matchTool, parseToolsFromSVG, stateLabel } from "@/lib/utils/tools";
import { LegendPanel } from "./LegendPanel";
import { applyToolStyles } from "./svg-state";
import { ToolInfoPanel } from "./ToolInfoPanel";
import type { FloorPlanProps, ToolGroup } from "./types";

export default function FloorPlan({ svgMarkup, svgWidth = 560, tools, className }: FloorPlanProps) {
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  // svgId of the currently selected group (null = show legend)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Tool groups discovered from the SVG at mount time
  const [discoveredGroups, setDiscoveredGroups] = useState<{ svgId: string; displayName: string }[]>([]);

  // Build full tool list by merging discovered SVG groups with tool/usage data
  const toolGroups = useMemo<ToolGroup[]>(() => {
    return discoveredGroups.map(({ svgId, displayName }) => {
      const match = matchTool(displayName, tools);
      const quantity = match ? match.quantity : getToolQuantity(tools, displayName);
      return {
        ...match,
        svgId,
        displayName,
        quantity,
        state: getToolState(match?.use_count ?? null, quantity),
        name: match?.name ?? null,
      };
    });
  }, [discoveredGroups, tools]);

  const totalActive = toolGroups.reduce((t, m) => t + (m.use_count ?? 0), 0);
  const totalQuantity = toolGroups.reduce((t, m) => t + m.quantity, 0);
  const hoveredTool = hoveredId ? (toolGroups.find((m) => m.svgId === hoveredId) ?? null) : null;
  const hoveredTooltip = hoveredTool
    ? {
        title: hoveredTool.displayName,
        subtitle: stateLabel(hoveredTool),
      }
    : hoveredId
      ? {
          title: hoveredId.replace(/-/g, " "),
          subtitle: null,
        }
      : null;
  const viewportWidth = mapViewportRef.current?.clientWidth ?? 0;
  const tooltipLeft = tooltipPos ? Math.max(8, Math.min(tooltipPos.x + 12, Math.max(8, viewportWidth - 228))) : 8;
  const tooltipTop = tooltipPos ? Math.max(8, tooltipPos.y - 14) : 8;

  // Mount: discover tool groups from SVG structure and wire click handlers
  useEffect(() => {
    const wrapper = svgWrapperRef.current;
    if (!wrapper) return;

    const parsed = new DOMParser().parseFromString(svgMarkup!, "image/svg+xml");
    const parsedSvg = parsed.documentElement;
    if (parsedSvg?.localName === "svg") {
      wrapper.replaceChildren(document.importNode(parsedSvg, true));
    }

    const svg = wrapper.querySelector("svg")!;

    svg.style.width = `${svgWidth}px`;
    svg.style.height = "auto";
    svg.style.display = "block";

    const eventController = new AbortController();
    let selectableIds = new Set<string>();
    let tooltipOnlyIds = new Set<string>();

    const resolveMappedGroupId = (target: EventTarget | null): string | null => {
      let node = target instanceof Element ? target : null;
      while (node && node !== svg) {
        const hitboxFor = node.getAttribute("data-tool-hitbox-for");
        if (hitboxFor) return hitboxFor;
        if (node.id && (selectableIds.has(node.id) || tooltipOnlyIds.has(node.id))) return node.id;
        node = node.parentElement;
      }
      return null;
    };

    const groups = parseToolsFromSVG(svg);
    selectableIds = new Set(groups.map((g) => g.svgId));
    tooltipOnlyIds = new Set(
      EXTRA_TOOLTIP_REGIONS.filter(
        (svgId) => !selectableIds.has(svgId) && Boolean(svg.querySelector(`[id="${CSS.escape(svgId)}"]`)),
      ),
    );

    setDiscoveredGroups(groups);

    const updateTooltipPosition = (ev: MouseEvent) => {
      const viewport = mapViewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      setTooltipPos({
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      });
    };

    const moveHandler = (ev: Event) => {
      const mouseEvent = ev as MouseEvent;
      const svgId = resolveMappedGroupId(mouseEvent.target);

      if (svgId) {
        setHoveredId(svgId);
        updateTooltipPosition(mouseEvent);
      } else {
        setHoveredId(null);
      }
    };

    const leaveHandler = () => {
      setHoveredId(null);
      setTooltipPos(null);
    };

    const clickHandler = (ev: Event) => {
      const svgId = resolveMappedGroupId(ev.target);
      if (!svgId) return;
      if (!selectableIds.has(svgId)) return;
      ev.stopPropagation();
      setSelectedId((prev) => (prev === svgId ? null : svgId));
    };

    svg.addEventListener("mousemove", moveHandler, { signal: eventController.signal });
    svg.addEventListener("mouseleave", leaveHandler, { signal: eventController.signal });
    svg.addEventListener("click", clickHandler, { signal: eventController.signal });

    return () => {
      eventController.abort();
      setHoveredId(null);
      setTooltipPos(null);
    };
    // We only need to run once after the SVG mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgMarkup, svgWidth]);

  // Apply visual state + selection styling to SVG groups whenever data changes
  useEffect(() => {
    const wrapper = svgWrapperRef.current;
    if (!wrapper) return;
    const svg = wrapper.querySelector("svg");
    if (!svg) return;

    applyToolStyles(svg, toolGroups, selectedId);
  }, [toolGroups, selectedId]);

  const hasRenderableSvg = Boolean(svgMarkup);

  if (!hasRenderableSvg) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="size-4" />
            Floor Plan
          </CardTitle>
          <CardDescription>No floor plan SVG provided for this location.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No floor plan available</AlertTitle>
            <AlertDescription>A floor plan SVG has not been configured for this location yet.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const selectedTool = selectedId ? toolGroups.find((m) => m.svgId === selectedId) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinned className="size-4" />
          Tool Map
        </CardTitle>
        <CardDescription>
          Click a tool on the map or in the list to see details. Scroll to zoom, drag to pan.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_20rem]">
        {/* Map canvas */}
        <div className="space-y-2">
          <div ref={mapViewportRef} className="relative h-136 overflow-hidden rounded-xl border bg-accent lg:h-168">
            <TransformWrapper
              initialScale={1}
              minScale={0.55}
              maxScale={5}
              centerOnInit
              centerZoomedOut
              limitToBounds
              wheel={{ step: 0.08 }}
              pinch={{ step: 5 }}
              doubleClick={{ step: 0.7 }}
            >
              {({ zoomIn, zoomOut, centerView }) => (
                <>
                  {hoveredTooltip?.title && tooltipPos ? (
                    <Tooltip open={true}>
                      <TooltipTrigger asChild>
                        <div
                          className="pointer-events-none absolute size-0"
                          style={{
                            left: tooltipLeft,
                            top: tooltipTop,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-56">
                        <div className="space-y-1">
                          <p className="font-medium">{hoveredTooltip.title}</p>
                          {hoveredTooltip.subtitle ? (
                            <p className="text-xs text-muted-foreground">{hoveredTooltip.subtitle}</p>
                          ) : null}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}

                  <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
                    <Button variant="outline" size="icon" onClick={() => zoomIn()} title="Zoom in">
                      <ZoomIn className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => zoomOut()} title="Zoom out">
                      <ZoomOut className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => centerView(1)} title="Reset view">
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </div>
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "fit-content", height: "fit-content" }}
                  >
                    <div ref={svgWrapperRef} className="tool-floor-plan dark:invert" />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>

          {/* State colour guide */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            {STATE_COLOUR_GUIDE.map(({ dot, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1">
                <span className={`size-2 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Side panel: info or legend */}
        <div className="h-136 lg:h-168">
          {selectedTool?.name ? (
            <ToolInfoPanel tool={selectedTool} onClose={() => setSelectedId(null)} />
          ) : (
            <LegendPanel tools={toolGroups} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
