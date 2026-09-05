import { Temporal } from "@js-temporal/polyfill";
import { MaterialSchema, PrioritySchema } from "@packages/db/zod/modules/printing";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Switch } from "@packages/ui/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BoxIcon,
  ClipboardCheckIcon,
  FileCodeIcon,
  FlagIcon,
  GaugeIcon,
  KeyRoundIcon,
  ListTodoIcon,
  MessageSquareTextIcon,
  PaletteIcon,
  ShieldAlertIcon,
  UploadIcon,
  UserIcon,
  VideoIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Hammer } from "@/components/loading";
import {
  ANY_COLOUR,
  formatRemaining,
  MATERIAL_TEMPS,
  type Material,
  parseGcode,
  type ScanResult,
  type SelectedUser,
  UserSearch,
} from "@/components/printing/utils";
import { useUser } from "@/hooks/useUser";
import { orpc } from "@/lib/orpc";

const LEAD_GREEN_MAX_DAYS = 2;
const LEAD_YELLOW_MAX_DAYS = 5;

const COPY_DELAY_MS = 1000;
const PRIORITIES = PrioritySchema.options;
const MATERIALS = MaterialSchema.options;

const MATERIAL_MAX_MINUTES: Record<Material, number> = {
  PLA: 7 * 60,
  PETG: 10 * 60,
  TPU: 10 * 60,
};

function leadDotColor(days: number): string {
  if (days < LEAD_GREEN_MAX_DAYS) return "bg-green-500";
  if (days < LEAD_YELLOW_MAX_DAYS) return "bg-yellow-500";
  return "bg-red-500";
}

function Section({
  title,
  icon,
  accent,
  locked,
  raised,
  children,
}: {
  title: string;
  icon: ReactNode;
  accent: string;
  locked: boolean;
  raised?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      aria-disabled={locked}
      className={`flex flex-col gap-3 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-opacity ${
        raised ? "relative z-20" : ""
      } ${locked ? "pointer-events-none opacity-40 select-none" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/_3dpuploadonly/printing/queue/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  const is_three_dp_member = user?.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");

  const { data, isPending, error } = useQuery(orpc.print.queue.length.queryOptions());
  const { data: printers } = useQuery(orpc.print.list.queryOptions({ input: { location: "ALL" } }));

  const [author, setAuthor] = useState<SelectedUser | null>(null);
  const [reason, setReason] = useState("");
  const [gcode, setGcode] = useState<File | null>(null);
  const [threemf, setThreemf] = useState<File | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [filament_colour, setFilamentColour] = useState("");
  const [printer_name, setPrinterName] = useState("");
  const [timelapse, setTimelapse] = useState(true);
  const [review, setReview] = useState(false);
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("LOW");
  const [rep, setRep] = useState<SelectedUser | null>(null);
  const [password, setPassword] = useState("");
  const [admin_password, setAdminPassword] = useState("");
  const [reset_key, setResetKey] = useState(0);
  const [copy_count, setCopyCount] = useState(0);
  const [base_name, setBaseName] = useState("");
  const [copy_waiting, setCopyWaiting] = useState(false);

  const admin_check = useMutation(orpc.print.admin.mutationOptions());

  const clearForm = () => {
    setAuthor(null);
    setReason("");
    setGcode(null);
    setThreemf(null);
    setScan(null);
    setFilamentColour("");
    setPrinterName("");
    setTimelapse(true);
    setReview(false);
    setPriority("LOW");
    setRep(null);
    setPassword("");
    setAdminPassword("");
    admin_check.reset();
    setResetKey((k) => k + 1);
  };

  const submit = useMutation(
    orpc.print.queue.add.mutationOptions({
      retry: (failureCount, error) => failureCount < 1 && (error as { code?: string }).code === "UPLOAD_FAILED",
      retryDelay: 1000,
      onSuccess: () => {
        setCopyCount((c) => c + 1);
        clearForm();
      },
    }),
  );

  const is_multi = (scan?.materials.length ?? 0) > 1;
  const material = scan?.materials[0] ?? "PLA";
  const print_materials: Material[] = scan?.materials.length ? scan.materials : ["PLA"];
  const limit_minutes = Math.min(...print_materials.map((m) => MATERIAL_MAX_MINUTES[m]));
  const over_spec = (scan?.minutes ?? 0) > limit_minutes;
  const admin_approved = admin_check.data?.ok === true;
  const force_review = over_spec && !admin_approved;
  const must_review = review || force_review;

  const filament_options = Array.from(
    new Map(
      (printers ?? [])
        .flatMap((p) => p.filament)
        .filter((f) => f.material === material)
        .map((f) => [f.colour, f]),
    ).values(),
  );
  const chosen_filament = filament_options.find((f) => f.colour === filament_colour);

  const author_done = author !== null;
  const reason_done = author_done && reason.trim() !== "";
  const gcode_done = reason_done && gcode !== null;
  const files_done = gcode_done && threemf !== null;
  const scan_done = files_done && scan !== null && scan.minutes > 0 && scan.mass > 0 && scan.name.trim() !== "";
  const filament_done = is_multi ? printer_name !== "" : filament_colour !== "";
  const printer_done = scan_done && filament_done;
  const can_submit = printer_done && rep !== null && password !== "" && !submit.isPending;

  const onGcode = async (file: File | null) => {
    setGcode(file);
    setScan(file ? parseGcode(await file.text(), file.name) : null);
    setAdminPassword("");
    admin_check.reset();
  };

  const onSubmit = () => {
    if (submit.isPending || !author || !rep || !scan) return;
    setCopyCount(0);
    setBaseName(scan.name);
    const temps = chosen_filament
      ? {
          nozzle_temp_min: chosen_filament.nozzle_temp_min,
          nozzle_temp_max: chosen_filament.nozzle_temp_max,
          bed_temp: chosen_filament.bed_temp,
        }
      : MATERIAL_TEMPS[material];
    const filament = is_multi
      ? scan.materials.map((m) => ({ material: m, colour: ANY_COLOUR, ...MATERIAL_TEMPS[m] }))
      : [{ material, colour: filament_colour, ...temps }];

    submit.mutate({
      print: {
        name: scan.name,
        duration: Temporal.Duration.from({ minutes: scan.minutes }).toString(),
        mass: scan.mass,
        priority,
        reason: reason.trim() || null,
        filament,
        author: author.id,
        approved_by: rep.id,
        gcode: gcode!,
        threemf: threemf!,
        timelapse,
      },
      printer: is_multi ? printer_name : undefined,
      password,
      review: must_review,
    });
  };

  const onAnotherCopy = () => {
    if (submit.isPending || copy_waiting || !submit.variables) return;
    const variables = submit.variables;
    const prev = variables.print;
    const next_name = `${base_name} (${copy_count + 1})`;
    setCopyWaiting(true);
    setTimeout(() => {
      setCopyWaiting(false);
      submit.mutate({
        ...variables,
        print: {
          ...prev,
          name: next_name,
          gcode: new File([prev.gcode], prev.gcode.name, { type: prev.gcode.type }),
          threemf: new File([prev.threemf], prev.threemf.name, { type: prev.threemf.type }),
        },
      });
    }, COPY_DELAY_MS);
  };

  return (
    <>
      <div className="flex">
        <h2 className="mx-14 mt-8 -mb-2 flex items-center gap-2 text-4xl font-futura text-balance">
          Upload your 3d print to the iForge print queue.
        </h2>
      </div>
      <div className="flex flex-row items-start gap-4 p-6">
        <div className="py-6">
          <Card className="w-fit py-6">
            <CardHeader className="flex flex-row items-center gap-2 font-bold text-left text-3xl font-futura -mb-4 text-primary">
              <ListTodoIcon className="size-7 shrink-0" />
              Print Queue:
            </CardHeader>
            <CardContent>
              {isPending && <Hammer />}
              {error && <div className="p-6">Failed to retrieve queue length: {error.message}</div>}
              {data && (
                <Table className="mb-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Queue</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Lead time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((queue) => (
                      <TableRow key={queue.queue}>
                        <TableCell className="font-medium capitalize">{queue.queue}</TableCell>
                        <TableCell>{queue.items}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span
                              className={`inline-block size-2.5 shrink-0 rounded-full ${leadDotColor(queue.lead_time.total("days"))}`}
                            />
                            {formatRemaining(queue.lead_time.total("seconds"))}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="shrink-0 rounded-xl border bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3">
                <h2 className="flex items-center gap-2 font-bold">
                  <GaugeIcon className="size-4 text-amber-600" />
                  Max print times
                </h2>
                <ul className="list-disc pl-5">
                  {MATERIALS.map((m) => (
                    <li key={m}>
                      {m}: {MATERIAL_MAX_MINUTES[m] / 60} hours
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-4 py-6 w-full">
          <Card className="relative flex-1 overflow-hidden py-6">
            <img
              src="/homepage/hs-inside.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06] select-none"
            />
            <CardHeader className="relative flex flex-row items-center gap-2 font-bold text-left text-3xl font-futura -mb-4 text-primary">
              <UploadIcon className="size-7 shrink-0" />
              Upload to print queue:
            </CardHeader>
            <CardContent className="relative flex flex-col gap-4">
              <Section
                title="Author"
                icon={<UserIcon className="size-4" />}
                accent="bg-blue-500/10 text-blue-600"
                locked={false}
                raised
              >
                <UserSearch placeholder="Search user" selected={author} onSelect={setAuthor} />
              </Section>

              <Section
                title="Reason for print"
                icon={<MessageSquareTextIcon className="size-4" />}
                accent="bg-violet-500/10 text-violet-600"
                locked={!author_done}
              >
                <Input
                  placeholder="e.g. MAC222 or Personal"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Section>

              <Section
                title="Upload G-code"
                icon={<FileCodeIcon className="size-4" />}
                accent="bg-amber-500/10 text-amber-600"
                locked={!reason_done}
              >
                <Input
                  key={reset_key}
                  type="file"
                  accept=".gcode"
                  onChange={(e) => onGcode(e.target.files?.[0] ?? null)}
                />
              </Section>

              <Section
                title="Upload 3MF"
                icon={<BoxIcon className="size-4" />}
                accent="bg-orange-500/10 text-orange-600"
                locked={!gcode_done}
              >
                <Input
                  key={reset_key}
                  type="file"
                  accept=".3mf"
                  onChange={(e) => setThreemf(e.target.files?.[0] ?? null)}
                />
              </Section>

              <Section
                title="Print details"
                icon={<GaugeIcon className="size-4" />}
                accent="bg-cyan-500/10 text-cyan-600"
                locked={!files_done}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <Input
                      value={scan?.name ?? ""}
                      onChange={(e) => setScan((s) => (s ? { ...s, name: e.target.value } : s))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <Input disabled value={formatRemaining((scan?.minutes ?? 0) * 60)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Mass (g)</span>
                    <Input disabled value={scan?.mass ?? 0} />
                  </div>
                </div>
                {over_spec && (
                  <p className="text-sm text-destructive">
                    Over the {limit_minutes / 60}h limit for {print_materials.join("/")} — without admin approval this
                    print goes under review.
                  </p>
                )}
              </Section>

              {over_spec && (
                <Section
                  title="Admin approval"
                  icon={<ShieldAlertIcon className="size-4" />}
                  accent="bg-red-500/10 text-red-600"
                  locked={!scan_done}
                >
                  <p className="text-sm text-muted-foreground">
                    This print exceeds the {limit_minutes / 60}h limit for {print_materials.join("/")}. Enter an admin
                    password to queue it directly, or submit it without approval to send it under review.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Admin password"
                      value={admin_password}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (admin_check.data || admin_check.isError) admin_check.reset();
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={admin_password === "" || admin_check.isPending || admin_approved}
                      onClick={() => admin_check.mutate({ password: admin_password })}
                    >
                      {admin_check.isPending ? "Checking…" : admin_approved ? "Approved" : "Verify"}
                    </Button>
                  </div>
                  {admin_check.data && !admin_check.data.ok && (
                    <p className="text-sm text-destructive">Incorrect admin password.</p>
                  )}
                  {admin_approved && <p className="text-sm text-green-600">Admin approved.</p>}
                </Section>
              )}

              <Section
                title="Filament"
                icon={<PaletteIcon className="size-4" />}
                accent="bg-pink-500/10 text-pink-600"
                locked={!scan_done}
              >
                {is_multi ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Multi-material ({scan?.materials.join(", ")}) — pick a multi-material printer.
                    </p>
                    <Select value={printer_name} onValueChange={setPrinterName}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select printer" />
                      </SelectTrigger>
                      <SelectContent>
                        {(printers ?? [])
                          .filter((p) => p.driver === "BAMBU")
                          .map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{material} — pick a loaded filament.</p>
                    <Select value={filament_colour} onValueChange={setFilamentColour}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select filament" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ANY_COLOUR}>Any colour</SelectItem>
                        {filament_options.map((f) => (
                          <SelectItem key={f.colour} value={f.colour}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-3 rounded-full border"
                                style={{ backgroundColor: `#${f.colour.slice(0, 6)}` }}
                              />
                              #{f.colour.slice(0, 6)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </Section>

              <Section
                title="Timelapse"
                icon={<VideoIcon className="size-4" />}
                accent="bg-teal-500/10 text-teal-600"
                locked={!printer_done}
              >
                <div className="flex items-center gap-3">
                  <Switch id="timelapse" checked={timelapse} onCheckedChange={setTimelapse} />
                  <span>Record a timelapse</span>
                </div>
              </Section>

              <Section
                title="Review"
                icon={<ClipboardCheckIcon className="size-4" />}
                accent="bg-amber-500/10 text-amber-600"
                locked={!printer_done}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    id="review"
                    checked={must_review}
                    disabled={force_review}
                    onCheckedChange={setReview}
                    className="disabled:opacity-100"
                  />
                  <span>Submit under review</span>
                </div>
                {force_review && (
                  <p className="text-sm text-muted-foreground">
                    Over the {limit_minutes / 60}h limit for {print_materials.join("/")} without admin approval — this
                    print must be checked by a 3DP rep before it can be sent.
                  </p>
                )}
              </Section>

              {is_three_dp_member && (
                <Section
                  title="Priority"
                  icon={<FlagIcon className="size-4" />}
                  accent="bg-yellow-500/10 text-yellow-600"
                  locked={!printer_done}
                >
                  <Select value={priority} onValueChange={(v) => setPriority(v as (typeof PRIORITIES)[number])}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p.toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Section>
              )}

              <Section
                title="Rep approval"
                icon={<KeyRoundIcon className="size-4" />}
                accent="bg-green-500/10 text-green-600"
                locked={!printer_done}
                raised
              >
                <UserSearch placeholder="Rep username" requireRep selected={rep} onSelect={setRep} />
                <Input
                  type="password"
                  placeholder="Upload password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Section>

              {submit.error && <p className="text-sm text-destructive">{submit.error.message}</p>}
              {submit.isSuccess && (
                <div className="flex flex-col gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                  {submit.variables?.review ? (
                    <p className="text-sm text-amber-600">
                      Submitted under review — a 3DP rep must approve it before it enters the queue.
                    </p>
                  ) : (
                    <p className="text-sm text-green-600">
                      Added to queue — position {submit.data.position}, lead time{" "}
                      {formatRemaining(submit.data.lead_time.total("seconds"))}.
                    </p>
                  )}
                  <p className="text-xs font-medium text-muted-foreground">
                    {copy_count} {copy_count === 1 ? "copy" : "copies"} of this print submitted.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submit.isPending || copy_waiting || !submit.variables}
                    onClick={onAnotherCopy}
                  >
                    {submit.isPending ? "Submitting…" : copy_waiting ? "Waiting…" : "Submit another copy"}
                  </Button>
                </div>
              )}

              <Button type="submit" disabled={!can_submit} onClick={onSubmit} className="w-full">
                {submit.isPending ? "Submitting…" : "Submit to queue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
