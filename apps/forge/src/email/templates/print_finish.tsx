import { format } from "date-fns";
import { Container, Hr, Text } from "jsx-email";
import { Email } from "../components/heading";
import { Link } from "../components/link";
import type { EmailPrintFinishDetails } from "@/lib/printers/email";
import * as React from "react";

export function Template({
  finished_at = new Date(),
  print_name = "{print_name}",
  success = true,
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
              Please come collect your print from the {location} <br />
            </>
          )}
          {!success && (
            <>
              {requeue ? "It has been requeued" : "It has not been requeued"} <br />
              it failed because: {reason} <br />
            </>
          )}
          {success ? `It took ${attempt} attempts` : `It is on attempt ${attempt}`} <br />
          {!success && requeue && attempt >= 3 && (
            <>
              As it has taken more than 3 attempts, it has been put under review <br />
            </>
          )}
          View your other {!success && requeue ? "and requeued " : ""}prints{" "}
          <Link href="https://iforge.sheffield.ac.uk/printing/user/queue">here</Link>
        </Text>
      </Container>
    </Email>
  );
}
