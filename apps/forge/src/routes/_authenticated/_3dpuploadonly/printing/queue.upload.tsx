import { Temporal } from "@js-temporal/polyfill";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Hammer } from "@/components/loading";
import { formatRemaining } from "@/components/printing/utils";
import { orpc } from "@/lib/orpc";
import { useUser } from "@/hooks/useUser";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import { Input } from "@packages/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@packages/ui/components/select";
import { Switch } from "@packages/ui/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import {
  BoxIcon,
  CheckIcon,
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
import { useState, type ReactNode } from "react";

const LEAD_GREEN_MAX_DAYS = 2;
const LEAD_YELLOW_MAX_DAYS = 5;

const ANY_COLOUR = "ANY";
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
const MATERIALS = ["PLA", "PETG", "TPU"] as const;
type Material = (typeof MATERIALS)[number];

const MATERIAL_MAX_MINUTES: Record<Material, number> = {
  PLA: 7 * 60,
  PETG: 10 * 60,
  TPU: 10 * 60,
};

const MATERIAL_TEMPS: Record<Material, { nozzle_temp_min: number; nozzle_temp_max: number; bed_temp: number }> = {
  PLA: { nozzle_temp_min: 190, nozzle_temp_max: 220, bed_temp: 60 },
  PETG: { nozzle_temp_min: 230, nozzle_temp_max: 250, bed_temp: 80 },
  TPU: { nozzle_temp_min: 210, nozzle_temp_max: 230, bed_temp: 40 },
};

function leadDotColor(days: number): string {
  if (days < LEAD_GREEN_MAX_DAYS) return "bg-green-500";
  if (days < LEAD_YELLOW_MAX_DAYS) return "bg-yellow-500";
  return "bg-red-500";
}

type ScanResult = { name: string; minutes: number; mass: number; materials: Material[] };

function parseTimeToMinutes(raw: string): number {
  const num = (unit: string) => Number(new RegExp(`(\\d+)\\s*${unit}`, "i").exec(raw)?.[1] ?? 0);
  return num("d") * 1440 + num("h") * 60 + num("m") + Math.round(num("s") / 60);
}

function parseGcode(text: string, filename: string): ScanResult {
  const timeMatch = text.match(/estimated (?:printing )?time[^\n:=]*[:=]\s*([0-9hmsd \t]+)/i);
  const massMatch =
    text.match(/filament used \[g\][^\n:=]*[:=]\s*([\d.]+)/i) ??
    text.match(/(?:total )?filament (?:used|weight)[^\n:=]*\[g\][^\n:=]*[:=]\s*([\d.]+)/i);
  const materials = [...text.matchAll(/filament_type[^\n:=]*[:=]\s*([A-Za-z0-9;, ]+)/gi)]
    .flatMap((m) => m[1].split(/[;,\s]+/))
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is Material => (MATERIALS as readonly string[]).includes(s));

  return {
    name: filename.replace(/\.(gcode|3mf)$/i, ""),
    minutes: timeMatch ? parseTimeToMinutes(timeMatch[1]) : 0,
    mass: massMatch ? Math.round(Number(massMatch[1])) : 0,
    materials: [...new Set(materials)],
  };
}

function Section({
  title,
  icon,
  accent,
  locked,
  children,
}: {
  title: string;
  icon: ReactNode;
  accent: string;
  locked: boolean;
  children: ReactNode;
}) {
  return (
    <div
      aria-disabled={locked}
      className={`flex flex-col gap-3 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-opacity ${
        locked ? "pointer-events-none opacity-40 select-none" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

type SelectedUser = { id: string; display_name: string };

function UserSearch({
  placeholder,
  requireRep,
  selected,
  onSelect,
}: {
  placeholder: string;
  requireRep?: boolean;
  selected: SelectedUser | null;
  onSelect: (user: SelectedUser | null) => void;
}) {
  const [query, setQuery] = useState("");
  const { data } = useQuery({
    ...orpc.users.search.queryOptions({ input: { query, limit: 5 } }),
    enabled: query.trim().length > 1,
  });

  const results = (data ?? []).filter(
    (u) => !requireRep || u.roles.some((r) => r.name === "Rep" || r.name === "Admin"),
  );

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-green-500/5 px-3 py-2">
        <span className="flex items-center gap-2">
          <CheckIcon className="size-4 text-green-500" />
          {selected.display_name}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Input placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      {results.length > 0 && (
        <div className="flex flex-col rounded-md border">
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              className="flex flex-col items-start px-3 py-2 text-left hover:bg-muted"
              onClick={() => {
                onSelect({ id: u.id, display_name: u.display_name });
                setQuery("");
              }}
            >
              <span className="font-medium">{u.display_name}</span>
              <span className="text-xs text-muted-foreground">@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/_3dpuploadonly/printing/queue/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  const isThreeDpMember = user?.__typename === "users::Rep" && user.teams.some((t) => t.name === "3DP");

  const { data, isPending, error } = useQuery(orpc.print.queue.length.queryOptions());
  const { data: printers } = useQuery(orpc.print.list.queryOptions({ input: { location: "ALL" } }));

  const [author, setAuthor] = useState<SelectedUser | null>(null);
  const [reason, setReason] = useState("");
  const [gcode, setGcode] = useState<File | null>(null);
  const [threemf, setThreemf] = useState<File | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [filamentColour, setFilamentColour] = useState("");
  const [printerName, setPrinterName] = useState("");
  const [timelapse, setTimelapse] = useState(false);
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("LOW");
  const [rep, setRep] = useState<SelectedUser | null>(null);
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const submit = useMutation(orpc.print.queue.add.mutationOptions());
  const adminCheck = useMutation(orpc.print.admin.mutationOptions());

  const isMulti = (scan?.materials.length ?? 0) > 1;
  const material = scan?.materials[0] ?? "PLA";
  const printMaterials: Material[] = scan?.materials.length ? scan.materials : ["PLA"];
  const limitMinutes = Math.min(...printMaterials.map((m) => MATERIAL_MAX_MINUTES[m]));
  const overSpec = (scan?.minutes ?? 0) > limitMinutes;
  const adminApproved = adminCheck.data?.ok === true;

  const filamentOptions = Array.from(
    new Map(
      (printers ?? [])
        .flatMap((p) => p.filament)
        .filter((f) => f.material === material)
        .map((f) => [f.colour, f]),
    ).values(),
  );
  const chosenFilament = filamentOptions.find((f) => f.colour === filamentColour);

  const authorDone = author !== null;
  const reasonDone = authorDone && reason.trim() !== "";
  const gcodeDone = reasonDone && gcode !== null;
  const filesDone = gcodeDone && threemf !== null;
  const scanDone = filesDone && scan !== null && scan.minutes > 0 && scan.mass > 0 && scan.name.trim() !== "";
  const scanCleared = scanDone && (!overSpec || adminApproved);
  const filamentDone = isMulti ? printerName !== "" : filamentColour !== "";
  const printerDone = scanCleared && filamentDone;
  const canSubmit = printerDone && rep !== null && password !== "" && !submit.isPending;

  const onGcode = async (file: File | null) => {
    setGcode(file);
    setScan(file ? parseGcode(await file.text(), file.name) : null);
    setAdminPassword("");
    adminCheck.reset();
  };

  const onSubmit = () => {
    if (!author || !rep || !scan) return;
    const temps = chosenFilament
      ? {
          nozzle_temp_min: chosenFilament.nozzle_temp_min,
          nozzle_temp_max: chosenFilament.nozzle_temp_max,
          bed_temp: chosenFilament.bed_temp,
        }
      : MATERIAL_TEMPS[material];
    const filament = isMulti
      ? scan.materials.map((m) => ({ material: m, colour: ANY_COLOUR, ...MATERIAL_TEMPS[m] }))
      : [{ material, colour: filamentColour, ...temps }];

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
      printer: isMulti ? printerName : undefined,
      password,
    });
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
              >
                <UserSearch placeholder="Search member" selected={author} onSelect={setAuthor} />
              </Section>

              <Section
                title="Reason for print"
                icon={<MessageSquareTextIcon className="size-4" />}
                accent="bg-violet-500/10 text-violet-600"
                locked={!authorDone}
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
                locked={!reasonDone}
              >
                <Input type="file" accept=".gcode" onChange={(e) => onGcode(e.target.files?.[0] ?? null)} />
              </Section>

              <Section
                title="Upload 3MF"
                icon={<BoxIcon className="size-4" />}
                accent="bg-orange-500/10 text-orange-600"
                locked={!gcodeDone}
              >
                <Input type="file" accept=".3mf" onChange={(e) => setThreemf(e.target.files?.[0] ?? null)} />
              </Section>

              <Section
                title="Print details"
                icon={<GaugeIcon className="size-4" />}
                accent="bg-cyan-500/10 text-cyan-600"
                locked={!filesDone}
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
                {overSpec && (
                  <p className="text-sm text-destructive">
                    Over the {limitMinutes / 60}h limit for {printMaterials.join("/")} — admin approval required.
                  </p>
                )}
              </Section>

              {overSpec && (
                <Section
                  title="Admin approval"
                  icon={<ShieldAlertIcon className="size-4" />}
                  accent="bg-red-500/10 text-red-600"
                  locked={!scanDone}
                >
                  <p className="text-sm text-muted-foreground">
                    This print exceeds the {limitMinutes / 60}h limit for {printMaterials.join("/")}. Enter an admin
                    password to continue.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Admin password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (adminCheck.data || adminCheck.isError) adminCheck.reset();
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={adminPassword === "" || adminCheck.isPending || adminApproved}
                      onClick={() => adminCheck.mutate({ password: adminPassword })}
                    >
                      {adminCheck.isPending ? "Checking…" : adminApproved ? "Approved" : "Verify"}
                    </Button>
                  </div>
                  {adminCheck.data && !adminCheck.data.ok && (
                    <p className="text-sm text-destructive">Incorrect admin password.</p>
                  )}
                  {adminApproved && <p className="text-sm text-green-600">Admin approved.</p>}
                </Section>
              )}

              <Section
                title="Filament"
                icon={<PaletteIcon className="size-4" />}
                accent="bg-pink-500/10 text-pink-600"
                locked={!scanCleared}
              >
                {isMulti ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Multi-material ({scan?.materials.join(", ")}) — pick a multi-material printer.
                    </p>
                    <Select value={printerName} onValueChange={setPrinterName}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select printer" />
                      </SelectTrigger>
                      <SelectContent>
                        {(printers ?? []).map((p) => (
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
                    <Select value={filamentColour} onValueChange={setFilamentColour}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select filament" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ANY_COLOUR}>Any colour</SelectItem>
                        {filamentOptions.map((f) => (
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
                locked={!printerDone}
              >
                <div className="flex items-center gap-3">
                  <Switch id="timelapse" checked={timelapse} onCheckedChange={setTimelapse} />
                  <span>Record a timelapse</span>
                </div>
              </Section>

              {isThreeDpMember && (
                <Section
                  title="Priority"
                  icon={<FlagIcon className="size-4" />}
                  accent="bg-yellow-500/10 text-yellow-600"
                  locked={!printerDone}
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
                locked={!printerDone}
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
                <p className="text-sm text-green-600">
                  Added to queue — position {submit.data.position}, lead time{" "}
                  {formatRemaining(submit.data.lead_time.total("seconds"))}.
                </p>
              )}

              <Button type="submit" disabled={!canSubmit} onClick={onSubmit} className="w-full">
                {submit.isPending ? "Submitting…" : "Submit to queue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
