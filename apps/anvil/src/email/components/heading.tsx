import {
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Tailwind,
} from "jsx-email";
import * as React from "react";
import { Footer } from "./footer";

export function Header() {
  return (
    <Row align="center">
      <Column align="center">
        <Img
          src={`${process.env.CDN_URL}/logos/iforge.png`}
          width="300"
          style={{ margin: 20 }} // m-10 doesn't work with uno-css out the box
        />
      </Column>
    </Row>
  );
}

export function Email({
  preview,
  title,
  heading,
  children,
}: {
  preview: string;
  title: string;
  heading: string;
  children: React.JSX.Element[];
}) {
  return (
    <Html>
      <Head>
        <Preview>{preview}</Preview>
        <title>{title}</title>
        <style>
          {`
          @font-face {
            font-family: Futura-Heavy;
            src: url(${process.env.CDN_URL}/fonts/FuturaPTHeavy.otf);
          }

          body {
            padding: 20px;
            background-color: #f4f4f4;
            font-family: Helvetica, Arial, sans-serif;
          }

          a {
            color: #CE5C4D;
          }

          h1 {
            font-family: Futura-Heavy, Helvetica;
            color: #271918;
          }
          `}
        </style>
      </Head>
      <Header />
      <Tailwind
        config={{
          theme: {
            fontFamily: {
              "futura-heavy": ["Futura-Heavy", "Helvetica"],
            },
          },
        }}
        production={process.env.NODE_ENV === "production"}
      >
        <Heading className="text-center">{heading}</Heading>
        {children}
        <Footer unsubscribe />
      </Tailwind>
    </Html>
  );
}
