import { format } from "date-fns";
import { Container, Hr, Text } from "jsx-email";
import { Email } from "../components/heading";
import { Link } from "../components/link";
import type { EmailPrintFinishDetails } from "@/lib/printers/email";
import { toTitleCase } from "@/lib/utils";
import * as React from "react";

export function Template({
  finished_at = new Date(),
  print_name = "{print_name}",
  success = false,
  requeue = false,
  reason = "{reason}",
  attempt = 1,
  location = "MAINSPACE",
}: EmailPrintFinishDetails) {
  const finished_at_str = format(finished_at, "p 'on' PP");

  return (
    <Email
      preview={`Your print: ${print_name}, ${success ? "was completed" : "failed"}`}
      title={`Your print ${success ? "was completed" : "failed"}`}
      heading={`Your print: ${print_name},  ${success ? "was completed" : "failed"}`}
    >
      <Hr />
      <Container>
        <Text>
          Hey there! <br />
          Your print: {print_name}, has finished at {finished_at_str} and was {success ? "successful" : "unsuccessful"}.{" "}
          <br />
          {success && (
            <>
              Please come collect your print from the {toTitleCase(location)} <br />
            </>
          )}
          {!success && (
            <>
              {requeue ? "It has been requeued and will be attempted again" : "It has not been requeued"} <br />
              It failed because: {reason} <br />
            </>
          )}
          {success ? `It took ${attempt} attempt/s` : `It is on attempt ${attempt}`} <br />
          {!success && requeue && attempt >= 3 && (
            <>
              As it has taken more than 3 attempt/s, it has been put under review <br />
            </>
          )}
          View your other {!success && requeue ? "and requeued " : ""}prints{" "}
          <Link href="https://iforge.sheffield.ac.uk/printing/user/queue">here</Link>
        </Text>
      </Container>
    </Email>
  );
}
