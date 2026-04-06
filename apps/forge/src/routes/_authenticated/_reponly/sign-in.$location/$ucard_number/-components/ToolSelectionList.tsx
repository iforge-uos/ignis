import { GetSignInToolsReturns } from "@packages/db/queries/getSignInTools.query";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "@packages/ui/components/card";
import { Checkbox } from "@packages/ui/components/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { Kbd, Shortcut } from "@packages/ui/components/kbd";
import { Label } from "@packages/ui/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import { ChevronLeft, ChevronRight, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShortcutKey } from "@/hooks/useShortcutKey";
import { cn } from "@/lib/utils/cn";
import { getToolCardInfo, ToolLegend } from "./ToolLegend";


type Tool = GetSignInToolsReturns[number];

interface ToolSelectionCardProps {
  tool: Tool;
  index: number;
  toggleTool: (tool: Tool) => void;
  selected: boolean;
  onlyComplete: boolean;
}

const ToolSelectionCard = ({ tool, index, toggleTool: toggleTraining, selected, onlyComplete }: ToolSelectionCardProps) => {
  const info = getToolCardInfo(tool);
  const selectable = info[0].name === "SELECTABLE";
  return (
    <Card
      className={cn(
        "transition-all relative overflow-hidden h-full hover:bg-accent/40",
        selectable ? "cursor-pointer" : "opacity-70",
        selected
          ? "ring-2 ring-primary"
          : "hover:text-foreground",      )}
      onClick={() => selectable && toggleTraining(tool)}
    >
      <CardHeader >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectable && <Kbd className="text-xs text-muted-foreground">{index === 9 ? 0 : index + 1}</Kbd>}
            <div className="font-medium text-sm">{tool.name}</div>
            <div className="flex space-x-1">
          {!onlyComplete && info.map((entry) => (
            <Tooltip key={entry.label}>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className={cn(
                    entry.colour,
                    "px-1 py-1 text-[10px] text-white font-medium rounded-sm border border-white/10 backdrop-blur-sm hover:cursor-pointer leading-none",
                  )}
                >
                  <entry.icon
                    className="size-3.5! shrink-0 text-white transition-colors"
                  />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{entry.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-3">{tool.description}</p>
      </CardContent>

    </Card>
  );
};

interface ToolSelectionProps {
  tools: Tool[];
  initialSelection?: Tool[];
  onSelectionChange?: (selectedTools: Tool[]) => void;
}

export function ToolSelection({
  tools: _tools,
  onSelectionChange,
  initialSelection = [],
}: ToolSelectionProps) {
  const [selectedTools, setSelectedTools] = useState<Tool[]>(initialSelection);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const itemsPerPage = 8;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [onlyComplete, setOnlyComplete] = useState<string | boolean>(false);
  const tools = useMemo(
    () =>
      _tools
        .filter((tool) => (onlyComplete ? tool.selectable.length === 0 : tool))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [_tools, onlyComplete],
  );
  const fuse = useMemo(() => new Fuse(tools, {
    keys: ["name", "description"],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
  }), [tools]);

  const filteredTools = useMemo(() => {
    if (!searchTerm) return tools;
    return fuse.search(searchTerm).map((result) => result.item);
  }, [searchTerm, fuse, tools]);

  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTools = filteredTools.slice(startIndex, startIndex + itemsPerPage);

  const toggleTool = (tool: Tool) => {
    setSelectedTools((prev) =>
      prev.some((t) => t.id === tool.id) ? prev.filter((t) => t.id !== tool.id) : [...prev, tool],
    );
  };

  const changePage = (newPage: number) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  useEffect(() => {
    onSelectionChange?.(selectedTools);
  }, [selectedTools, onSelectionChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        const newPage = e.key === "[" ? Math.max(currentPage - 1, 1) : Math.min(currentPage + 1, totalPages);
        changePage(newPage);
      } else if (e.key >= "0" && e.key <= "9") {
        const index = e.key === "0" ? 9 : Number.parseInt(e.key) - 1;
        if (index < visibleTools.length) {
          const tool = visibleTools[index];
          if (!tool.selectable.length) {
            toggleTool(tool);
          }
        }
      } else if (e.key === "f" && (shortcut === "Ctrl" ? e.ctrlKey : e.metaKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        finalise();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleTools, currentPage, totalPages]);

  const pageTransition = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 20 : -20,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -20 : 20,
      transition: {
        duration: 0.15,
        ease: "easeInOut",
      },
    }),
  };

  const badgeVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 30,
        mass: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };
  const shortcut = useShortcutKey();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <InputGroup className="w-[80%]">
          <InputGroupAddon>
            <Search className="w-4.5 h-4.5" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            ref={searchInputRef}
          />
          <InputGroupAddon align="inline-end">
            <Shortcut keys={[shortcut, "F"]} className="text-sm text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
        <div className="flex items-center gap-2">
          <Checkbox id="only-complete" checked={Boolean(onlyComplete)} onCheckedChange={setOnlyComplete} />
          <Label className="hover:cursor-pointer" htmlFor="only-complete">
            Only complete
          </Label>
          {!onlyComplete && <ToolLegend />}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
        >
          {visibleTools.map((tool, index) => (
            <ToolSelectionCard
              key={tool.id}
              onlyComplete={onlyComplete}
              tool={tool}
              index={index}
              toggleTool={toggleTool}
              selected={selectedTools.some((t) => t.id === tool.id)}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => changePage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          <span>Previous</span>
          <Shortcut keys={["["]} className="ml-1 text-sm text-muted-foreground" />
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight className="w-4.5 h-4.5" />
          <Shortcut keys={["]"]} className="ml-1 text-sm text-muted-foreground" />
        </Button>
      </motion.div>
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {selectedTools.map((tool) => (
            <motion.div key={tool.id} variants={badgeVariants} animate="animate" exit="exit" layout>
              <Badge
                variant="secondary"
                className="px-2 py-1 text-xs font-medium rounded-sm flex items-center bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {tool.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-2 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTool(tool);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
