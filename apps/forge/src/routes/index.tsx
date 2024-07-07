import { HeartspaceIcon, MainspaceIcon } from "@/components/icons/Locations";
import { IForgeLogo } from "@/components/icons/iforge";
import Title from "@/components/title";
import useWindowScroll from "@react-hook/window-scroll";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "@ui/components/layout-grid";
import Marquee from "@ui/components/marquee";
import { StickyScroll } from "@ui/components/sticky-scroll-reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/components/ui/accordion";
import { Button } from "@ui/components/ui/button";
import { Separator } from "@ui/components/ui/separator";
import { ArrowUpRight } from "lucide-react";
import { Masonry, useInfiniteLoader } from "masonic";
import React from "react";
import Balancer from "react-wrap-balancer";

type FAQItem = {
  question: string;
  answer: string;
  link?: string;
};

const faqItems: FAQItem[] = [
  {
    question: "Lorem ipsum dolor sit amet?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    link: "https://google.com",
  },
  {
    question: "Ut enim ad minim veniam?",
    answer:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    question: "Duis aute irure dolor in reprehenderit?",
    answer: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    question: "Excepteur sint occaecat cupidatat non proident?",
    answer:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

const locationInfo = [
  {
    title: (
      <div className="flex items-center">
        <MainspaceIcon /> Mainspace
      </div>
    ),
    sections: [
      {
        description: `The Mainspace is the iForge's go-to location for electronics, woodworking, and metalworking. We
        offer a variety of tools to allow you to tackle any sort of project. Whether you're a beginner looking to learn
        new skills or an experienced maker working on complex projects, the Mainspace is equipped to support your
        creative journey. Our space fosters a community of innovation, learning, and collaboration.`,
        content: (
          <div className="h-full w-full flex object-contain">
            <img src="iForge Asset Bank IMG 0221 HDR.JPG" />
          </div>
        ),
      },
      {
        description: (
          <div>
            The Mainspace is located in{" "}
            <a
              href="https://g.co/kgs/hXYvVNH"
              className="text-primary hover:cursor-pointer hover:underline underline-offset-4"
            >
              The Diamond
            </a>{" "}
            on the first floor. This location is easily accessible for students and staff to pop in to after (or during)
            lectures to explore the realms of fabrication and design with our student volunteer reps.
          </div>
        ),
        content: (
          <div className="h-full w-full flex object-contain">
            <img src="Log2.jpg" />
          </div>
        ),
      },
    ],
  },
  {},
  {
    title: (
      <div className="flex items-center">
        <HeartspaceIcon /> Heartspace
      </div>
    ),
    sections: [
      {
        description: `The Heartspace is a vibrant hub, dedicated to crafts, textiles, vinyl cutting, and both SLA and PETG
      3D printing. It's the perfect place for creators who are passionate about bringing their intricate designs and
      ideas to life. Whether you're exploring the world of fashion, creating custom gifts, or prototyping with 3D
      printing, the Heartspace provides the tools and support to unleash your creativity.`,
        content: (
          <div className="h-full w-full flex object-contain">
            <img src="Marketing IMG 1367.jpg" />
          </div>
        ),
      },
    ],
  },
  {
    description: (
      <div>
        The Heartspace is located in{" "}
        <a
          href="https://g.co/kgs/R65qVGb"
          className="text-primary hover:cursor-pointer hover:underline underline-offset-4"
        >
          The Engineering Heartspace
        </a>{" "}
        above the café, the Heartspace offers an easily accessible, inspiring environment for students and staff. Its
        location encourages spontaneous visits, allowing individuals to engage with textile and craft projects between
        classes or during free periods. With guidance from our knowledgeable student volunteers, the Heartspace is not
        just a workspace but a community where creativity flourishes.
      </div>
    ),
    content: (
      <div className="h-full w-full flex object-contain">
        <img src="hs_from_the_front2.jpg" />
      </div>
    ),
  },
];

const IndexComponent = () => {
  return (
    <>
      <Title prompt="Home" />
      <div className="flex justify-center my-12">
        <IForgeLogo className="w-96 pointer-events-none" />
      </div>
      <Balancer className="mx-14 text-4xl mb-4">
        The iForge is the UK's first student lead makerspace located at The University of Sheffield.
      </Balancer>
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background py-20 md:shadow-xl">
        <Marquee pauseOnHover className="[--duration:30s]">
          <img src="/Marketing Photos IMG 1321.jpg" alt="Marketing Photo" className="w-96 object-cover" />
          <img src="/Summer Shoot BO4A8974.JPG" alt="Summer Shoot" className="w-96 object-cover" />
          <img src="/Diamond Day 1 Photo 263.jpg" alt="Diamond Day" className="w-96 object-cover" />
          <img src="/MG 9087.jpg" alt="MG Photo" className="w-96 object-cover" />
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:30s]">
          {/* {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))} */}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background" />
      </div>
      <Balancer className="mx-14 text-2xl my-8">
        Join us to collaborate, create, and innovate through hands-on making and learning.
      </Balancer>
      <div className="px-14">
        <div className="flex flex-col items-center gap-6 rounded-lg border bg-accent/50 p-6 text-center md:rounded-xl md:p-12">
          <h2 className="!my-0 text-4xl font-bold">Sign Up Now!</h2>
          <h3 className="!mb-0 text-muted-foreground">
            <Balancer className="text-2xl">
              Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Balancer>
          </h3>
          <div className="not-prose mx-auto flex items-center gap-2">
            <Button className="w-fit" asChild>
              <Link href="#">Get Started</Link>
              {/* TODO link to old blog page? */}
            </Button>
            <Button className="w-fit" variant="link" asChild>
              <Link href="#">
                Learn More <ArrowUpRight className="ml-1" size="16" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />
      <div className="mx-14">
        <div className="text-3xl font-bold">What can you do in the iForge?</div>
        <div className="not-prose mt-4 flex flex-col gap-4 md:mt-8">
          {faqItems.map((item, index) => (
            <Accordion key={index} type="single" collapsible>
              <AccordionItem value={item.question}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-base md:w-3/4">
                  {item.answer}
                  {item.link && (
                    <div>
                      <Button className="px-0" variant="link" asChild>
                        <a href={item.link}>
                          Learn More <ArrowUpRight className="ml-1" size="16" />
                        </a>
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>

      <Separator className="my-8" />
      <div className="mx-14">
        <div className="text-3xl font-bold">Our Locations</div>
        <StickyScroll content={locationInfo} />
      </div>
      {/* <Separator className="my-8" />
      <div className="mx-14">
        <div className="text-3xl font-bold">What are people making?</div>
      // TODO when you have a lot of patience use https://www.npmjs.com/package/react-responsive-masonry to finish this
      </div> */}
    </>
  );
};

export const Route = createFileRoute("/")({ component: IndexComponent, staticData: { title: "Home" } });
