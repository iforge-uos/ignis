import { Temporal } from "@js-temporal/polyfill";
import { format } from "date-fns";
import { Container, Hr, Text } from "jsx-email";
import { Email } from "../components/heading";
import { Link } from "../components/link";
import type { EmailPrintUploadDetails } from "@/lib/printers/email";
import * as React from "react";

export function Template({
  created_at = new Date(),
  print_name = "{print_name}",
  position = 1,
  lead_time = new Temporal.Duration(),
}: EmailPrintUploadDetails) {
  const { days, hours, minutes } = lead_time.round({ largestUnit: "days", smallestUnit: "minutes" });
  const lead_time_str =
    [
      days && `${days} day${days === 1 ? "" : "s"}`,
      hours && `${hours} hour${hours === 1 ? "" : "s"}`,
      minutes && `${minutes} minute${minutes === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join(", ") || "less than a minute";

  const queued_at = format(created_at, "p 'on' PP");

  return (
    <Email
      preview={`Your print: ${print_name}, has been queued`}
      title="Your print has been queued"
      heading={`Your print: ${print_name}, has been queued`}
    >
      <Hr />
      <Container>
        <Text>
          Hey there! <br />
          Your print: {print_name}, has been added to the print queue at {queued_at}. <br />
          Position: {position} <br />
          Estimated lead time: {lead_time_str} <br />
          Get live updates on your queued items{" "}
          <Link href="https://iforge.sheffield.ac.uk/printing/user/queue">here</Link>
        </Text>
      </Container>
    </Email>
  );
}
