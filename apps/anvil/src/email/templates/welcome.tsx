import { Text, Hr, Container } from "jsx-email";
import * as React from "react";
import type { PartialUser } from "@ignis/types/users";
import { Email } from "../components/heading";
import { Link } from "../components/link";

export function WelcomeEmail({
  display_name = "{display-name}",
  id = "0000-0000-0000-0000",
}: PartialUser) {
  return (
    <Email
      preview={`Welcome to the iForge ${display_name}`}
      title="Welcome to the iForge"
      heading={`Welcome to the iForge, ${display_name}!`}
    >
      <Hr />
      <Container>
        <Text>
          We're glad to have you. Here are some things you might want to do now:
        </Text>
        <ul>
          <li>
            <Text>
              Set up your profile{' '}
              <Link href={`${process.env.FRONT_END_URL}/user`}>here</Link>.
            </Text>
          </li>
          <li>
            <Text>
              Start a new project or{' '}
              <Link href="https://iforgesheffield.org/user-projects/">
                get some inspiration
              </Link>
              .
            </Text>
          </li>
          <li>
            <Text>
              Come and visit either of our spaces if you haven't already :)
            </Text>
          </li>
        </ul>
      </Container>
    </Email>
  );
}

export default WelcomeEmail;
