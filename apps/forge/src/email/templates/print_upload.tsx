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
  review = false,
  position = 1,
  lead_time = Temporal.Duration.from({ days: 1, hours: 3, minutes: 20 }),
}: EmailPrintUploadDetails) {
  const { days, hours, minutes } = lead_time.round({ largestUnit: "days", smallestUnit: "minutes" });
  const leadTime =
    [
      days && `${days} day${days === 1 ? "" : "s"}`,
      hours && `${hours} hour${hours === 1 ? "" : "s"}`,
      minutes && `${minutes} minute${minutes === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join(", ") || "less than a minute";

  const uploadedAt = format(created_at, "p 'on' PP");
  const summary = review ? "is under review" : "has been queued";

  return (
    <Email
      preview={`Your print: ${print_name}, ${summary}`}
      title={`Your print ${summary}`}
      heading={`Your print: ${print_name}, ${summary}`}
    >
      <Hr />
      <Container>
        {review ? (
          <Text>
            Hey there! <br />
            Your print: {print_name}, was uploaded at {uploadedAt} and has been put under review to be checked by a 3DP
            rep. <br />
            It will be added to the print queue once approved. <br />
            Get live updates on your items{" "}
            <Link href="https://iforge.sheffield.ac.uk/printing/user/queue">here</Link>
          </Text>
        ) : (
          <Text>
            Hey there! <br />
            Your print: {print_name}, has been added to the print queue at {uploadedAt}. <br />
            Position: {position} <br />
            Estimated lead time: {leadTime} <br />
            Get live updates on your queued items{" "}
            <Link href="https://iforge.sheffield.ac.uk/printing/user/queue">here</Link>
          </Text>
        )}
      </Container>
    </Email>
  );
}
