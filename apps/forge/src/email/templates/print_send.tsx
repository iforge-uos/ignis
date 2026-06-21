import { Temporal } from "@js-temporal/polyfill";
import { format } from "date-fns";
import { Container, Hr, Text } from "jsx-email";
import { Email } from "../components/heading";
import { Link } from "../components/link";
import type { EmailPrintSendDetails } from "@/lib/printers/email";
import { toTitleCase } from "@/lib/utils";
import * as React from "react";

export function Template({
  sent_at = new Date(),
  print_name = "{print_name}",
  print_time = new Temporal.Duration(),
  printer = "{printer}",
  location = "MAINSPACE",
}: EmailPrintSendDetails) {
  const { hours, minutes } = print_time.round({ largestUnit: "hours", smallestUnit: "minutes" });
  const print_time_str =
    [hours && `${hours} hour${hours === 1 ? "" : "s"}`, minutes && `${minutes} minute${minutes === 1 ? "" : "s"}`]
      .filter(Boolean)
      .join(", ") || "less than a minute";

  const sent_at_str = format(sent_at, "p 'on' PP");

  return (
    <Email
      preview={`Your print: ${print_name}, is now printing`}
      title="Your print is now printing"
      heading={`Your print: ${print_name}, is now printing`}
    >
      <Hr />
      <Container>
        <Text>
          Hey there! <br />
          Your print: {print_name}, started printing at {sent_at_str} in the {toTitleCase(location)} on {printer}.{" "}
          <br />
          It will be complete in roughly {print_time_str} <br />
          Get live updates on your print{" "}
          <Link href={`https://iforge.sheffield.ac.uk/printing/public/${printer}`}>here</Link>
        </Text>
      </Container>
    </Email>
  );
}
