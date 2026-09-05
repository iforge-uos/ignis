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
  review = false,
  requeue = false,
  reason = "unknown",
  attempt = 1,
  location = "MAINSPACE",
}: EmailPrintFinishDetails) {
  const finished_at_str = format(finished_at, "p 'on' PP");
  const under_review = !success && (review || (requeue && attempt >= 3));
  const requeued = !success && (requeue || review);

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
              It failed because: {reason} <br />
              {under_review ? (
                <>
                  It has been put under review to be checked by a 3DP rep and will be attempted again. <br />
                </>
              ) : requeued ? (
                <>
                  It has been requeued and will be attempted again. <br />
                </>
              ) : (
                <>
                  It has not been requeued. <br />
                </>
              )}
            </>
          )}
          {success ? `It took ${attempt} attempt/s` : `It is on attempt ${attempt}`} <br />
          View your other {requeued ? "and requeued " : ""}prints{" "}
          <Link href="https://iforge.sheffield.ac.uk/printing/user/queue">here</Link>
        </Text>
      </Container>
    </Email>
  );
}
