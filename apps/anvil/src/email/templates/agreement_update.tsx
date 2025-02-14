import { Agreement } from "@ignis/types/root";
import { PartialUser } from "@ignis/types/users";
import { Container, Hr, Text } from "jsx-email";
import * as React from "react";
import { Email } from "../components/heading";
import { Link } from "../components/link";

export function AgreementUpdate(
  { user, agreement }: { user: PartialUser; agreement: Agreement } = {
    user: {
      id: "u-0000-0000-0000-0000",
      display_name: "{display_name}",
      email: "{email}",
      username: "{username}",
      ucard_number: 0,
      created_at: new Date(),
      roles: [{ id: "r-0000-0000-0000-0000", name: "User" }],
    },
    agreement: {
      id: "a-0000-0000-0000-0000",
      name: "An Agreement",
      created_at: new Date(),
      updated_at: new Date(),
      content: "Some lil content",
      version: 0,
      reasons: [],
    },
  },
) {
  return (
    <Email
      preview="An important update to User Agreement"
      title="iForge place available"
      heading={`The ${agreement.name} Has Been Updated, Please Re-sign It`}
    >
      <Hr />
      <Container>
        <Text>
          Hi {user.display_name},
          <br />
          Please can you{" "}
          <Link href={`https://iforge.sheffield.ac.uk/sign-in/agreements/${agreement.id}`}>
            sign the newest version of the {agreement.name}.
          </Link>
          As you won't be able to sign in with the {agreement.reasons.map((r) => r.name)} reason(s) without it.
        </Text>
      </Container>
    </Email>
  );
}

export const Template = AgreementUpdate;
export default AgreementUpdate;
