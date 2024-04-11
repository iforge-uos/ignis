import { Text, Hr, Container } from "jsx-email";
import * as React from "react";
import { Email } from "../components/heading";
import { Link } from "../components/link";
import type { PartialUser } from "@ignis/types/users";

export function Unqueued({
  id = "0000-0000-0000-0000",
  location = "{location}",
}: PartialUser & { location: string }) {
  return (
    <Email
      preview="You're able to sign in to the iForge"
      title="iForge place available"
      heading={`A place in the iForge ${location} is available`}
    >
      <Hr />
      <Container>
        <Text>
          Please sign in in the next 15 minutes (by{" "}
          {new Date(new Date().getTime() + 1000 * 60 * 15).toLocaleTimeString()}
          ). Otherwise, your place will be given to the next person in the
          queue.
        </Text>

        <Text className="text-xs! text-center text-gray-500">
          If you no longer require your place please{" "}
          <Link
            href={`https://iforge.sheffield.ac.uk/${location}/queue/remove/${id}`} // FIXME this doesn't exist yet
          >
            click here
          </Link>{" "}
          to cancel.
        </Text>
      </Container>
    </Email>
  );
}

export default Unqueued;
