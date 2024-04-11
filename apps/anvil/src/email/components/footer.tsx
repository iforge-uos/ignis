import { Container, Hr, Text, Row, Column, Img } from "jsx-email";
import { Link } from "./link";
import * as React from "react";

export function SocialIcon({ name, href }: { name: string; href: string }) {
  return (
    <Column align="center">
      <Link href={href}>
        <Img
          src={`${process.env.CDN_URL}/icons/${name}.png`}
          width={24}
          height={24}
        />
      </Link>
    </Column>
  );
}

export function Footer({ unsubscribe = false }: { unsubscribe: boolean }) {
  return (
    <Container align="center">
      <Hr />
      <Row align="center" className="font-futura-heavy">
        <Column>
          <Link href={process.env.FRONT_END_URL}>
            <Text className="text-left">Website</Text>
          </Link>
        </Column>
        <Column>
          <Link href={`${process.env.FRONT_END_URL}/user/edit#email`}>
            <Text className="text-center">Manage Email Preferences</Text>
          </Link>
        </Column>
        <Column>
          <Link href={`${process.env.FRONT_END_URL}/socials`}>
            <Text className="text-right">Contact Us</Text>
          </Link>
        </Column>
      </Row>
      <Row align="center">
        <SocialIcon href="https://instagram.com/iforge_uos" name="instagram" />
        <SocialIcon href="https://discord.gg/AkTDMga" name="discord" />
        <SocialIcon href="https://twitter.com/iForgeUoS" name="twitter" />
        <SocialIcon
          href="https://linkedin.com/company/11336225"
          name="linkedin"
        />
        <SocialIcon
          href="https://youtube.com/channel/UCng4tusQKJ_S-knMu1ZkrPg"
          name="youtube"
        />
        <SocialIcon
          name="facebook"
          href="https://facebook.com/iForgeSheffield"
        />
      </Row>
      <Text className="text-center font-futura-heavy">
        <Link href="mailto:iforge@sheffield.ac.uk">iforge@sheffield.ac.uk</Link>{' '}
        - © {new Date().getFullYear()} iForge Makerspace
      </Text>
      <Hr />
    </Container>
  );
}
