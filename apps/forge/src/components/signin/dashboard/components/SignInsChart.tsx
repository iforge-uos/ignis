import { LocationIcon } from "@/components/icons/Locations";
import { SignInStat } from "@ignis/types/users";
import { Datum, ResponsiveCalendar } from "@nivo/calendar";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@ui/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table";
import * as React from "react";
import MediaQuery from "react-responsive";

type SignInDatum = Omit<Datum, "data"> & { data: Datum["data"] & SignInStat };

function SignInTable({ datum }: { datum: SignInDatum | null }) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-accent rounded">
          <TableHead>Location</TableHead>
          <TableHead>Entered</TableHead>
          <TableHead>Left</TableHead>
          <TableHead>Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datum?.data.sign_ins.map((sign_in) => {
          const hours = Math.floor(sign_in.duration! / 60 / 60);
          const hours_string = `${hours} hour${hours !== 1 ? "s" : ""}`;
          const minutes = Math.floor((sign_in.duration! % 3600) / 60);
          const minutes_string = `${minutes} minute${minutes !== 1 ? "s" : ""}`;

          return (
            <TableRow
              className="hover:bg-accent hover:cursor-pointer"
              onClick={() => navigate({ to: `/sign-ins/${sign_in.id}` as string })}
            >
              <TableCell className="flex justify-center">
                <LocationIcon location={sign_in.location} />
              </TableCell>
              <TableCell>{sign_in.created_at.toLocaleTimeString()}</TableCell>
              <TableCell>{sign_in.ends_at?.toLocaleTimeString() || "-"}</TableCell>
              <TableCell>
                {hours && minutes ? `${hours_string} and ${minutes_string}` : hours ? hours_string : minutes_string}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

const Entry = ({ day }: { day: string }) => {
  return <div className="bg-inherit p-4 rounded-md">{new Date(day).toLocaleDateString()}</div>;
};

export default function SignInsChart({ data }: { data: SignInStat[] }) {
  // Theming for this component is handled in index.css using selectors,
  // I'm sorry :(
  // TODO rewrite this to use nivo's theming engine and get the colours from the index.css dynamically?

  const [open, setOpen] = React.useState(false);
  const [datum, setDatum] = React.useState<SignInDatum | null>(null);

  return (
    <>
      <div className="h-60" id="sign-in-chart">
        <ResponsiveCalendar
          data={data}
          from={`${new Date().getFullYear()}-01-01`}
          to={`${new Date().getFullYear()}-12-31`}
          colors={["#E7B0A9", "#DF948B", "#D6776C", "#CE5B4D"]}
          emptyColor="#f8e9e7"
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          dayBorderWidth={2}
          legends={[
            {
              anchor: "bottom-right",
              direction: "row",
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: "right-to-left",
            },
          ]}
          tooltip={(props) => (props.value ? <Entry day={props.day} /> : <></>)}
          onMouseEnter={(_, event) => {
            event.currentTarget.style.cursor = "pointer"; // plouc/nivo#2276
          }}
          // @ts-expect-error: TS2322 the types here are wrong in the source
          onClick={(datum: SignInsDatum) => {
            if (!datum.data?.sign_ins) return;
            setOpen(true);
            setDatum(datum);
          }}
        />
      </div>

      <MediaQuery minWidth={768}>
        {(matches) => {
          const title = `Visits on ${datum?.date.toLocaleDateString()}`;
          return matches ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-center">{title}</DialogTitle>
                </DialogHeader>
                <SignInTable datum={datum} />
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>{title}</DrawerTitle>
                </DrawerHeader>
                <SignInTable datum={datum} />
                <DrawerFooter className="pt-2">
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          );
        }}
      </MediaQuery>
    </>
  );
}
