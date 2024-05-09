import { Location, QueueEntry } from "@ignis/types/sign_in";
import { Container, Hr, Text } from "jsx-email";
import * as React from "react";
import { Email } from "../components/heading";
import { Link } from "../components/link";

export function Queued({ id = "0000-0000-0000-0000", location = "{location}" }: QueueEntry & { location: Location }) {
  return (
    <Email
      preview="You're in the queue for the iForge"
      title="iForge queue request received"
      heading={`You're in the queue for the iForge ${location} is available`}
    >
      <Hr />
      <Container>
        <Text>
          Please sign in in the next 15 minutes (by{" "}
          {new Date(new Date().getTime() + 1000 * 60 * 15).toLocaleTimeString()}
          ). Otherwise, your place will be given to the next person in the queue.
        </Text>

        <Text className="text-xs! text-center text-gray-500">
          If you no longer require your place please{" "}
          <Link
            href={`https://iforge.sheffield.ac.uk/${location}/queue/delete/${id}`} // FIXME this doesn't exist yet
          >
            click here
          </Link>{" "}
          to cancel.
        </Text>
      </Container>
    </Email>
  );
}

export default Queued;
