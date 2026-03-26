import type { PartialUser } from "@packages/types/users";
import { Container, Hr, Text } from "jsx-email";
import * as React from "react";
// import { Email } from "../components/heading";
// import { Link } from "../components/link";

export function Template({ display_name = "{display-name}", id = "0000-0000-0000-0000" }: PartialUser) {
  return (
    <Email
      preview={`Welcome to the iForge ${display_name}`}
      title="Welcome to the iForge"
      heading={`Welcome to the iForge, ${display_name}!`}
    >
      <Hr />
      <Container>
        <Text>We're glad to have you. Here are some things you might want to do now:</Text>
        <ul>
          <li>
            <Text>
              Set up your profile <Link href="https://iforge.sheffield.ac.uk/user">here</Link>.
            </Text>
          </li>
          <li>
            <Text>
              Start a new project or <Link href="https://docs.iforge.sheffield.ac.uk/blog">get some inspiration</Link>
              .
            </Text>
          </li>
          <li>
            <Text>Come and visit either of our spaces if you haven't already :)</Text>
          </li>
        </ul>
      </Container>
    </Email>
  );
}
