"use client";

import { NoRepIcon } from "@ui/components/icons/NoRep";
import { RepIcon } from "@ui/components/icons/Rep";
import { cn, useShortcutKey } from "@/lib/utils";
import { Training, TrainingSelectability } from "@ignis/types/sign_in";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@ui/components/ui/card";
import { Checkbox } from "@ui/components/ui/checkbox";
import { Input } from "@ui/components/ui/input";
import { Kbd, Shortcut } from "@ui/components/ui/kbd";
import { Label } from "@ui/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import {
  AlertTriangle,
  Ban,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";

interface TrainingCardInfo {
  name: TrainingSelectability | "SELECTABLE" | "UNREACHABLE";
  icon: React.ElementType;
  colour: string;
  label: string;
  tooltip: string;
}

const SELECTABLE = {
  name: "SELECTABLE",
  icon: CheckIcon,
  colour: cn("bg-emerald-500/90 dark:bg-emerald-500"),
  label: "Available",
  tooltip: "This training is available and can be selected.",
} satisfies TrainingCardInfo;

const NO_TRAINING = {
  name: "NO_TRAINING",
  icon: AlertTriangle,
  colour: cn("bg-amber-500/90 dark:bg-amber-500"),
  label: "Not Complete",
  tooltip: "The user hasn't started this training.",
} satisfies TrainingCardInfo;

const REPS_UNTRAINED = {
  name: "REPS_UNTRAINED",
  icon: NoRepIcon,
  colour: cn("bg-orange-500/90 dark:bg-orange-500"),
  label: "Reps Untrained",
  tooltip: "The on-shift reps for this training are not yet trained on the associated machine for this.",
} satisfies TrainingCardInfo;

const IN_PERSON_MISSING = {
  name: "IN_PERSON_MISSING",
  icon: MapPin,
  colour: cn("bg-cyan-500/90 text-white dark:bg-cyan-500 dark:text-white"),
  label: "In-Person Required",
  tooltip: "This training requires an in-person session. Please schedule one to complete this training.",
} satisfies TrainingCardInfo;

const REVOKED = {
  name: "REVOKED",
  icon: Ban,
  colour: cn("bg-red-500/90 dark:bg-red-500"),
  label: "Revoked",
  tooltip: "This training has been revoked due to an infraction and has not been retaken since.",
} satisfies TrainingCardInfo;

const EXPIRED = {
  name: "EXPIRED",
  icon: Clock,
  colour: cn("bg-purple-500/90 dark:bg-purple-500"),
  label: "Expired",
  tooltip: "This training has expired and needs to be retaken.",
} satisfies TrainingCardInfo;

const UNREACHABLE = {
  name: "UNREACHABLE",
  icon: HelpCircle,
  colour: "bg-zinc-800 dark:bg-zinc-900",
  label: "Unknown Status",
  tooltip: "The status of this training is unknown. Please contact IT.",
} satisfies TrainingCardInfo;

const STATUS_MAP: Record<TrainingSelectability, TrainingCardInfo> = {
  NO_TRAINING,
  REPS_UNTRAINED,
  IN_PERSON_MISSING, // TODO allow these to be SELECTABLE but pop a warning saying that they need to be trained (only if the reps are trained to give it.)
  REVOKED,
  EXPIRED,
};

export const getTrainingCardInfo = (training: Training): TrainingCardInfo[] => {
  if (!training.selectable.length) {
    return [SELECTABLE];
  }

  return training.selectable.map((key) => STATUS_MAP[key] || UNREACHABLE);
};

interface TrainingSelectionCardProps {
  training: Training;
  index: number;
  toggleTraining: (training: Training) => void;
  selected: boolean;
}

const TrainingSelectionCard = ({ training, index, toggleTraining, selected }: TrainingSelectionCardProps) => {
  const selectable = training.enabled && !training.selectable.length;

  const info = getTrainingCardInfo(training);
  if (!info) {
    return null;
  }

  return (
    <Card
      className={cn(
        "transition-all relative overflow-hidden h-full",
        selectable ? "cursor-pointer" : "opacity-70",
        selected ? "ring-2 ring-primary" : "hover:bg-accent hover:text-accent-foreground",
      )}
      onClick={() => selectable && toggleTraining(training)}
    >
      <CardHeader className="p-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">{training.name}</div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{training.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-2">
        <div className="flex space-x-1">
          {info.map((entry) => (
            <Tooltip key={entry.label}>
              <TooltipTrigger>
                <Badge
                  className={cn(
                    entry.colour,
                    "px-1.5 py-0.5 text-[10px] text-white font-medium rounded-sm border border-white/10 backdrop-blur-sm",
                  )}
                >
                  <entry.icon
                    className={cn("w-4 h-4 transition-colors", selected ? "text-primary" : "text-muted-foreground")}
                  />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{entry.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {selectable && <Kbd className="ml-auto text-[10px] text-muted-foreground">{index === 9 ? 0 : index + 1}</Kbd>}
      </CardFooter>
    </Card>
  );
};

interface TrainingSelectionProps {
  training: Training[];
  initialSelection?: Training[];
  onSelectionChange: (selectedTrainings: Training[]) => void;
  onSubmit: () => void;
}

export default function TrainingSelection({
  training,
  onSelectionChange,
  onSubmit,
  initialSelection = [],
}: TrainingSelectionProps) {
  const [selectedTrainings, setSelectedTrainings] = useState<Training[]>(initialSelection);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const itemsPerPage = 8;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [onlyComplete, setOnlyComplete] = useState<string | boolean>(true);
  const training_ = training
    .filter((training) => (onlyComplete ? !training.selectable.includes("NO_TRAINING") : training))
    .sort((a, b) => a.name.localeCompare(b.name));
  const fuse = new Fuse(training_, {
    keys: ["name", "description"],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
  });

  const filteredTrainings = useMemo(() => {
    if (!searchTerm) return training_;
    return fuse.search(searchTerm).map((result) => result.item);
  }, [searchTerm, fuse, training_]);

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTrainings = filteredTrainings.slice(startIndex, startIndex + itemsPerPage);

  const toggleTraining = (training: Training) => {
    setSelectedTrainings((prev) =>
      prev.some((t) => t.id === training.id) ? prev.filter((t) => t.id !== training.id) : [...prev, training],
    );
  };

  const changePage = (newPage: number) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  useEffect(() => {
    onSelectionChange(selectedTrainings);
  }, [selectedTrainings, onSelectionChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        const newPage = e.key === "[" ? Math.max(currentPage - 1, 1) : Math.min(currentPage + 1, totalPages);
        changePage(newPage);
      } else if (e.key >= "0" && e.key <= "9") {
        const index = e.key === "0" ? 9 : Number.parseInt(e.key) - 1;
        if (index < visibleTrainings.length) {
          const training = visibleTrainings[index];
          if (training.enabled && !training.selectable.length) {
            toggleTraining(training);
          }
        }
      } else if (e.key === "f" && (shortcut === "Ctrl" ? e.ctrlKey : e.metaKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleTrainings, currentPage, totalPages, onSubmit]);

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
        <div className="flex items-center space-x-2 relative w-[80%]">
          <Search className="w-5 h-5 text-gray-400 absolute left-[18px]" />
          <Input
            type="text"
            placeholder="Search trainings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-grow pl-9"
            ref={searchInputRef}
          />
          <Shortcut keys={[shortcut, "F"]} className="absolute right-2 text-xs text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="only-complete" checked={Boolean(onlyComplete)} onCheckedChange={setOnlyComplete} />
          <Label className="hover:cursor-pointer" htmlFor="only-complete">
            Only complete
          </Label>
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
          {visibleTrainings.map((training, index) => (
            <TrainingSelectionCard
              key={training.id}
              training={training}
              index={index}
              toggleTraining={toggleTraining}
              selected={selectedTrainings.some((training_) => training_.id === training.id)}
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
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
          <Shortcut keys={["["]} className="ml-1 text-xs text-muted-foreground" />
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
          <ChevronRight className="w-4 h-4" />
          <Shortcut keys={["]"]} className="ml-1 text-xs text-muted-foreground" />
        </Button>
      </motion.div>
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {selectedTrainings.map((training) => (

              <motion.div
                key={training.id}
                variants={badgeVariants}

                animate="animate"
                exit="exit"
                layout>

                <Badge
                  variant="secondary"
                  className="px-2 py-1 text-xs font-medium rounded-sm flex items-center bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {training.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-2 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTraining(training);
                    }}
                  >
                    <XCircle className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              </motion.div>
            ) )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
