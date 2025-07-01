import { toTemporalInstant } from "@js-temporal/polyfill";
import { QueueEntry } from "@packages/types/sign_in";
import { format } from "date-fns";
import { Container, Hr, Section, Text } from "jsx-email";
import * as React from "react";
import { Email } from "../components/heading";
import { Link } from "../components/link";

export function Template({
  id = "0000-0000-0000-0000",
  location = "{location}",
  ends_at = new Date(Date() + 5 * 60 * 1000),
}: QueueEntry & { location: string }) {
  // const duration = ends_at.toTemporalInstant().subtract(duration);
  const expirationTime = format(ends_at.toTemporalInstant().subtract({ minutes: 5 }).epochMilliseconds, "p");

  return (
    <Email
      preview="You're able to sign in to the iForge"
      title="iForge Place Available"
      heading={`A place in the iForge ${location} is available`}
    >
      <Container className="bg-white rounded-lg shadow-lg max-w-xl mx-auto">
        <Section className="px-8 py-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Hey there!</Text>
          <Text className="text-base text-gray-600 mb-6">
            Please sign in within the next 15 minutes (by {expirationTime}). Otherwise, your place will be given to the
            next person in the queue.
          </Text>
          <Hr className="border-t border-gray-300 my-6" />
          <Text className="text-sm text-center text-gray-500">
            If you no longer require your place, please{" "}
            <Link
              href={`https://iforge.sheffield.ac.uk/${location}/queue/delete/${id}`}
              className="text-blue-600 hover:underline"
            >
              click here
            </Link>{" "}
            to cancel.
          </Text>
        </Section>
      </Container>
    </Email>
  );
}
