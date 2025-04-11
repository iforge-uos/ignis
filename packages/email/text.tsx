import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "jsx-email";
import React from "react";

const baseUrl = "https://jsx.email/assets/demo/";

export const templateName = "Nike Receipt";

export const Template = () => (
  <Html>
    <Head />
    <Preview>Get your order summary, estimated delivery date and more</Preview>
    <Tailwind config={require("@ignis/ui/tailwind.config")}>
      <Body className="bg-white font-sans">
        <Container className="mx-auto my-2.5 w-[600px] border border-gray-200">
          <Section className="bg-gray-50 py-6 px-10">
            <Row>
              <Column>
                <Text className="font-bold">Tracking Number</Text>
                <Text className="mt-3 font-medium text-gray-600">1ZV218970300071628</Text>
              </Column>
              <Column align="right">
                <Link className="border border-gray-400 px-0 py-2.5 w-[220px] block text-center font-medium text-black no-underline">
                  Track Package
                </Link>
              </Column>
            </Row>
          </Section>

          <Hr className="border-t border-gray-200 m-0" />

          <Section className="px-[74px] py-10 text-center">
            <Img src={`${baseUrl}nike-logo.png`} width="66" height="22" alt="Nike" className="mx-auto" />
            <Heading className="text-3xl leading-snug font-bold text-center tracking-tight">It's On Its Way.</Heading>
            <Text className="text-gray-600 font-medium leading-8">
              You order's is on its way. Use the link above to track its progress.
            </Text>
            <Text className="text-gray-600 font-medium leading-8 mt-6">
              We´ve also charged your payment method for the cost of your order and will be removing any authorization
              holds.
            </Text>
          </Section>

          <Hr className="border-t border-[#E5E5E5]" />

          <Section className="py-6 px-10">
            <Text className="text-base font-bold">Shipping to: Bruce Wayne</Text>
            <Text className="text-gray-600 font-medium text-sm">2125 Chestnut St, San Francisco, CA 94123</Text>
          </Section>

          <Hr className="border-t border-gray-200" />

          <Section className="py-10 px-10">
            <Row>
              <Column>
                <Img src={`${baseUrl}nike-product.png`} alt="Product" className="float-left" width="260" />
              </Column>
              <Column className="align-top pl-3">
                <Text className="font-medium leading-relaxed">
                  Brazil 2022/23 Stadium Away Women's Nike Dri-FIT Soccer Jersey
                </Text>
                <Text className="text-gray-600 font-medium">Size L (12–14)</Text>
              </Column>
            </Row>
          </Section>

          <Hr className="border-t border-[#E5E5E5]" />

          <Section className="py-6 px-10">
            <Row className="inline-flex mb-10">
              <Column className="w-[170px]">
                <Text className="font-bold">Order Number</Text>
                <Text className="font-medium text-gray-600">C0106373851</Text>
              </Column>
              <Column>
                <Text className="font-bold">Order Date</Text>
                <Text className="font-medium text-gray-600">Sep 22, 2022</Text>
              </Column>
            </Row>
            <Row>
              <Column align="center">
                <Link className="border border-gray-400 text-sm px-0 py-2.5 w-[220px] block text-center font-medium text-black no-underline">
                  Order Status
                </Link>
              </Column>
            </Row>
          </Section>

          <Hr className="border-t border-[#E5E5E5]" />

          <Section className="py-5.5">
            <Row>
              <div className="text-3xl leading-snug font-bold text-center tracking-tight mb-6">Top Picks For You</div>
            </Row>
            <Row className="py-5">
              <Column className="px-1 text-center">
                <Img
                  src={`${baseUrl}nike-recomendation-1.png`}
                  alt="Brazil 2022/23 Stadium Away Women's Nike Dri-FIT Soccer Jersey"
                  width="100%"
                />
                <Text className="pt-3 font-medium">USWNT 2022/23 Stadium Home</Text>
                <Text className="text-gray-600 font-medium pt-1">Women's Nike Dri-FIT Soccer Jersey</Text>
              </Column>
              <Column className="px-1 text-center">
                <Img
                  src={`${baseUrl}nike-recomendation-2.png`}
                  alt="Brazil 2022/23 Stadium Away Women's Nike Dri-FIT Soccer Jersey"
                  width="100%"
                />
                <Text className="pt-3 font-medium">Brazil 2022/23 Stadium Goalkeeper</Text>
                <Text className="text-gray-600 font-medium pt-1">Men's Nike Dri-FIT Short-Sleeve Football Shirt</Text>
              </Column>
              <Column className="px-1 text-center">
                <Img
                  src={`${baseUrl}nike-recomendation-4.png`}
                  alt="Brazil 2022/23 Stadium Away Women's Nike Dri-FIT Soccer Jersey"
                  width="100%"
                />
                <Text className="pt-3 font-medium">FFF</Text>
                <Text className="text-gray-600 font-medium pt-1">Women's Soccer Jacket</Text>
              </Column>
              <Column className="px-1 text-center">
                <Img
                  src={`${baseUrl}nike-recomendation-4.png`}
                  alt="Brazil 2022/23 Stadium Away Women's Nike Dri-FIT Soccer Jersey"
                  width="100%"
                />
                <Text className="pt-3 font-medium">FFF</Text>
                <Text className="text-gray-600 font-medium pt-1">Women's Nike Pre-Match Football Top</Text>
              </Column>
            </Row>
          </Section>
          <Hr className="border-t border-[#E5E5E5]" />
          <Section className="bg-gray-50 px-5 py-5">
            <Text className="font-bold mb-4">Get Help</Text>
            <Row className="py-4 px-5">
              <Column className="w-1/3">
                <Link href="/" className="font-medium text-black text-sm">
                  Shipping Status
                </Link>
              </Column>
              <Column className="w-1/3">
                <Link href="/" className="font-medium text-black text-sm">
                  Shipping & Delivery
                </Link>
              </Column>
              <Column className="w-1/3">
                <Link href="/" className="font-medium text-black text-sm">
                  Returns & Exchanges
                </Link>
              </Column>
            </Row>
            <Row className="pb-5 px-5">
              <Column className="w-1/3">
                <Link href="/" className="font-medium text-black text-sm">
                  How to Return
                </Link>
              </Column>
              <Column className="w-2/3">
                <Link href="/" className="font-medium text-black text-sm">
                  Contact Options
                </Link>
              </Column>
            </Row>
            <Hr className="border-t border-[#E5E5E5]" />
            <Row className="pt-8 pb-5">
              <Column>
                <Row>
                  <Column className="w-[16px]">
                    <Img src={`${baseUrl}nike-phone.png`} width="16px" height="26px" className="pr-[14px]" />
                  </Column>
                  <Column>
                    <Text className="font-500 text-black text-[13.5px] mb-0">1-800-806-6453</Text>
                  </Column>
                </Row>
              </Column>
              <Column>
                <Text className="font-500 text-black text-[13.5px] mb-0">4 am - 11 pm PT</Text>
              </Column>
            </Row>
          </Section>
          <Hr className="border-t border-[#E5E5E5]" />
          <Section className="py-5.5">
            <Row>
              <Text className="text-[32px] leading-[1.3] font-700 text-center tracking-[-1px]">Nike.com</Text>
            </Row>
            <Row className="pt-3 w-[370px] mx-auto">
              <Column align="center">
                <Link href="/" className="font-500 text-black">
                  Men
                </Link>
              </Column>
              <Column align="center">
                <Link href="/" className="font-500 text-black">
                  Women
                </Link>
              </Column>
              <Column align="center">
                <Link href="/" className="font-500 text-black">
                  Kids
                </Link>
              </Column>
              <Column align="center">
                <Link href="/" className="font-500 text-black">
                  Customize
                </Link>
              </Column>
            </Row>
          </Section>
          <Hr className="border-t border-[#E5E5E5] mt-3" />
          <Section className="py-5.5">
            <Row className="w-[166px] mx-auto">
              <Column>
                <Text className="text-gray-400 text-sm text-center">Web Version</Text>
              </Column>
              <Column>
                <Text className="text-gray-400 text-sm text-center">Privacy Policy</Text>
              </Column>
            </Row>
            <Row>
              <Text className="text-gray-400 text-sm text-center pt-8 pb-8">
                Please contact us if you have any questions. (If you reply to this email, we won't be able to see it.)
              </Text>
            </Row>
          </Section>
          <Section className="py-6 text-center">
            <Text className="text-gray-400 text-sm">© 2022 Nike, Inc. All Rights Reserved.</Text>
            <Text className="text-gray-400 text-sm mt-2">
              NIKE, INC. One Bowerman Drive, Beaverton, Oregon 97005, USA.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
