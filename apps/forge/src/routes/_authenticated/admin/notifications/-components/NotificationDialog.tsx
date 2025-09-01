import { notification } from "@packages/db/interfaces";
import { Button } from "@packages/ui/components/button";
import { Checkbox } from "@packages/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/components/dialog";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import MultiSelect from "@packages/ui/components/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Textarea } from "@packages/ui/components/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import {
  AlertTriangleIcon,
  Bell,
  BookOpen,
  Calendar,
  CircleXIcon,
  Clock,
  HardHat,
  Info,
  Megaphone,
  PlusIcon,
  Printer,
  Shield,
  Signal,
  SignalLow,
  SignalMedium,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import z from "zod";
import { DELIVERY_METHOD_OPTIONS, NOTIFICATION_TYPES } from "@/lib/constants";
import { client } from "@/lib/orpc";
import { cn, exhaustiveGuard, toTitleCase } from "@/lib/utils";
import { priorityToName, Target, UNSELECTABLE_TYPES } from "@/lib/utils/notifications";
import { Procedures } from "@/types/router";
import { Hammer } from "/src/components/loading";

type Notification = Procedures["notifications"]["all"][number];
interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  notification?: Notification | null;
}

export function priorityToColour(priority: number) {
  switch (priority) {
    case 1:
      return "green-500";
    case 2:
      return "orange-500";
    case 3:
      return "red-500";
    default:
      return "grey-500";
  }
}

export function priorityToIcon(priority: number) {
  switch (priority) {
    case 1:
      return (
        <div className="relative w-6 h-6 flex items-center">
          <Signal className="absolute w-6 h-6 stroke-muted" />
          <SignalLow className={`absolute w-6 h-6 stroke-green-500`} />
        </div>
      );
    case 2:
      return (
        <div className="relative w-6 h-6 flex items-center">
          <Signal className="absolute w-6 h-6 stroke-muted" />
          <SignalMedium className={`absolute w-6 h-6 stroke-orange-500`} />
        </div>
      );
    case 3:
      return <Signal className={`w-6 h-6 stroke-red-500`} />;
    default:
      return <AlertTriangleIcon className={`w-6 h-6 stroke-${priorityToColour(priority)}`} />;
  }
}

export function notificationTypeToIcon(type: notification.Type) {
  switch (type) {
    case "ADMIN":
      return <Shield className="w-4 h-4" />;
    case "ADVERT":
      return <Megaphone className="w-4 h-4" />;
    case "ANNOUNCEMENT":
      return <Info className="w-4 h-4" />;
    case "EVENT":
      return <Calendar className="w-4 h-4" />;
    case "HEALTH_AND_SAFETY":
      return <HardHat className="w-4 h-4" />;
    case "INFRACTION":
      return <AlertTriangleIcon className="w-4 h-4" />;
    case "PRINTING":
      return <Printer className="w-4 h-4" />;
    case "QUEUE_SLOT_ACTIVE":
      return <Clock className="w-4 h-4" />;
    case "RECRUITMENT":
      return <UserPlus className="w-4 h-4" />;
    case "REFERRAL":
      return <Users className="w-4 h-4" />;
    case "REMINDER":
      return <Bell className="w-4 h-4" />;
    case "TRAINING":
      return <BookOpen className="w-4 h-4" />;
    default:
      return null;
  }
}

const DOWNCAST_TO_USER = new Set(["default::user", "users::Rep"]);
const IGNORED_TARGETS = new Set().union(DOWNCAST_TO_USER);
type Targets = Map<z.infer<typeof Target>, Omit<Notification["targets"][number], "__typename">[] | null>;

function search(target: z.infer<typeof Target>) {
  switch (target) {
    case "notification::AllReps":
    case "notification::AllUsers":
      return; // They shouldn't have an option to select anything
    case "event::Event":
      return client.events.search;
    case "default::user":
    case "users::Rep":
    case "users::User":
      return client.users.search;
    case "notification::MailingList":
      return client.notifications.mailingLists.search;
    case "team::Team":
      return client.teams.search;
    default:
      exhaustiveGuard(target);
  }
}

export function NotificationDialog({ isOpen, onClose, onSubmit, notification }: NotificationDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<notification.Type>("ANNOUNCEMENT");
  const [deliveryMethods, setDeliveryMethods] = useState<notification.DeliveryMethod[]>(["EMAIL"]);
  const [priority, setPriority] = useState(2);
  const [targets, setTargets] = useState<Targets>(new Map([["notification::AllUsers", null]]));

  useEffect(() => {
    if (notification) {
      setTitle(notification.title);
      setContent(notification.content);
      setType(notification.type);
      setDeliveryMethods(notification.delivery_methods);
      setPriority(notification.priority);
      setTargets(
        notification.targets.reduce((acc, t) => {
          // otherwise users::Rep doesn't render
          const key = DOWNCAST_TO_USER.has(t.__typename) ? "users::User" : t.__typename;
          if (key.startsWith("notification::All")) acc.set(key, null);
          else {
            const val = acc.get(key);
            if (val) val.push(t);
            else acc.set(key, [t]);
          }
          return acc;
        }, new Map() as Targets),
      );
    } else {
      // default state for a new notification
      setTitle("");
      setContent("");
      setType("ANNOUNCEMENT");
      setDeliveryMethods(["EMAIL"]);
      setPriority(2);
      setTargets(new Map([["notification::AllUsers", null]]));
    }
  }, [notification]);

  const handleDeliveryMethodChange = (method: notification.DeliveryMethod, checked: boolean) => {
    if (checked) {
      setDeliveryMethods((prev) => [...prev, method]);
    } else {
      setDeliveryMethods((prev) => prev.filter((m) => m !== method));
    }
  };

  const handleSubmit = () => {
    onSubmit({
      id: notification?.id,
      title,
      content,
      type,
      delivery_methods: deliveryMethods,
      priority,
      status: notification?.status ?? "DRAFT",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{notification ? "Edit notification" : "Create notification"}</DialogTitle>
          <DialogDescription>
            {notification
              ? "Edit the details of the notification."
              : "Fill in the details to create a new notification."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={(value) => setType(value as notification.Type)} value={type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_TYPES.map((type) =>
                  !UNSELECTABLE_TYPES.has(type) ? (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {notificationTypeToIcon(type)}
                        {toTitleCase(type.replace(/_/g, " "))}
                      </div>
                    </SelectItem>
                  ) : null,
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority.toString()} onValueChange={(value) => setPriority(Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(3)]
                  .map((_, priority) => priority + 1)
                  .map((priority) => (
                    <SelectItem value={priority.toString()} key={priority}>
                      {priorityToIcon(priority)} {priorityToName(priority)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Delivery Methods</Label>
            <div className="col-span-3 flex gap-4">
              {DELIVERY_METHOD_OPTIONS.map((method) => (
                <div key={method} className="flex items-center gap-2">
                  <Checkbox
                    id={method}
                    checked={deliveryMethods.includes(method)}
                    onCheckedChange={(checked) => handleDeliveryMethodChange(method, !!checked)}
                  />
                  <Label htmlFor={method}>{toTitleCase(method)}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Target Audience</Label>
            {targets
              .entries()
              .toArray()
              .map(([targetName, selected], idx) => (
                <React.Fragment key={targetName}>
                  {idx === 0 ? null : <div />}
                  <Select
                    value={targetName}
                    onValueChange={(value) => {
                      const newTarget = new Map(targets);
                      newTarget.delete(targetName);
                      setTargets(newTarget.set(value as z.infer<typeof Target>, []));
                    }}
                  >
                    <SelectTrigger className="w-max">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(Target.values).map((value) =>
                        !IGNORED_TARGETS.has(value) ? (
                          <SelectItem value={value} key={value}>
                            {value
                              .split("::")[1]
                              .replace(/([A-Z])/g, " $1") // replace the pascal case type name with one with spaces
                              .trimStart()}
                          </SelectItem>
                        ) : null,
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center my-auto gap-2 col-span-2">
                    <MultiSelect
                      triggerSearchOnFocus
                      loadingIndicator={<Hammer />}
                      emptyIndicator="Nothing found..."
                      value={selected?.map((t) => ({
                        value: t.id,
                        label: (t as any).display_name || (t as any).name,
                      }))}
                      onSearch={async (query) => {
                        if (!query) return [];
                        const targets = await search(targetName)?.({ query, limit: 5 });
                        return (
                          targets?.map((t) => ({ value: t.id, label: (t as any).display_name || (t as any).name })) ||
                          []
                        );
                      }}
                      onChange={(options) => {
                        const newTarget = new Map(targets);
                        newTarget.set(
                          targetName,
                          options.map((opt) => ({ id: opt.value, name: opt.label })),
                        );
                        setTargets(newTarget);
                      }}
                      delay={100}
                      disabled={targetName.startsWith("notification::All")}
                      placeholder={
                        targetName.startsWith("notification::All")
                          ? "Disabled, sending to all"
                          : "Search for entries..."
                      }
                    />
                    <CircleXIcon
                      className={cn(
                        "p-1 w-6",
                        targets.size <= 1
                          ? "stroke-muted"
                          : "hover:cursor-pointer stroke-destructive-foreground ",
                      )}
                      onClick={() => {
                        if (targets.size <= 1) return;
                        const newTarget = new Map(targets);
                        newTarget.delete(targetName);
                        setTargets(newTarget);
                      }}
                    />
                  </div>
                </React.Fragment>
              ))}
            <div />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="success"
                  className="col-span-3"
                  disabled={targets.size >= Target.values.size - IGNORED_TARGETS.size}
                  onClick={() =>
                    setTargets(
                      new Map(targets).set(
                        Target.values
                          .keys()
                          .filter((t) => !(targets.has(t) || IGNORED_TARGETS.has(t)))
                          .next().value!,
                        [],
                      ),
                    )
                  }
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add another target</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{notification ? "Save Changes" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
