import DotIndicator from "@/components/dot-indicator";
import { HeartspaceIcon, MainspaceIcon } from "@/components/icons/Locations";
import { IForgeLogo } from "@/components/icons/iforge";
import Title from "@/components/title";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/components/ui/accordion";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@ui/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@ui/components/ui/carousel";
import { Separator } from "@ui/components/ui/separator";
import { Timeline, TimelineDot, TimelineHeading, TimelineItem, TimelineLine } from "@ui/components/ui/timeline";
import Autoplay from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Masonry, useInfiniteLoader } from "masonic";
import React from "react";
import { useEffect, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";

type FAQItem = {
  question: React.ReactNode;
  answer: React.ReactNode;
};

const faqItems: FAQItem[] = [
  {
    question: "What are we here for?",
    answer: (
      <>
        Our mantra is "learning through making." We are open for students and staff to tinker, make mistakes, and learn
        in their free time. Everybody is welcome to work on personal projects and coursework and also allow other
        student teams to prototype.
      </>
    ),
  },
  {
    question: "What are your opening hours",
    answer: (
      <>
        The Mainspace is open from 12:00 to 20:00 and the Heartspace from 12:00 to 17:00, both Monday to Friday.
        However, we have limited hours during exams and holidays. Check our{" "}
        <a href="https://instagram.com/users/iforge_uos">
          <Button variant="hyperlink" className="text-lg">
            Instagram
          </Button>
        </a>{" "}
        or the bottom of the page for short-notice closures during term time due to events or unforeseen circumstances.
        <br />
        We may be open outside of these hours. To check, you can go to the{" "}
        <Link to="/signin">
          <Button variant="hyperlink" className="text-lg">
            Sign in page
          </Button>
        </Link>{" "}
        or the bottom of any page on this website.
        {/* TODO /status */}
      </>
    ),
  },
  {
    question: "What is our long term vision?",
    answer: (
      <>
        We want to empower people to be more capable and practical and build a community of makers that are resourceful
        and sustainable. For instance, we encourage the usage of scrap materials produced from offcuts.
      </>
    ),
  },
  {
    question: "What events do we run?",
    answer: (
      <div>
        We organise, run and host several workshops and events and offer skills workshops such as lamp making, furniture
        making, and CAD over the academic year. Events range from activities with limited numbers that users register
        for to day-long events where anyone can come and go throughout the day. To stay updated on our events, follow
        our{" "}
        <a href="https://instagram.com/users/iforge_uos">
          <Button variant="hyperlink" className="text-lg">
            Instagram
          </Button>
        </a>
        .
        <br />
        <br />
        We also collaborate with societies from The University of Sheffield or companies to run activities! If you're
        interested in creating an event with the iForge, our team would love to hear from you using any of the links on
        our{" "}
        <Link to="/contact">
          <Button variant="hyperlink" className="text-lg">
            Contact
          </Button>
        </Link>{" "}
        page.
      </div>
    ),
  },
  {
    question: "Is the iForge free?",
    answer: (
      <>
        In short, <span className="font-bold">yes!</span>
        <br />
        <br />
        You can use all our machines for free, even our 3D printers and electronic components. You get £10 credit at the
        beginning of each semester (capped at £10) to spend on materials for personal projects, and after spending that,
        materials come from your print credit. If you need materials for a module or CCA-related work, you can charge
        materials to their associated accounts at the till.
      </>
    ),
  },
  {
    question: "Do I need to book?",
    answer: (
      <>
        No, you don't need to book to use any of our locations. Just come in during our opening hours on the day. You
        may need to queue for the iForge if we are full. After being added to the queue at the front desk, you will
        receive an email when a place is available. We will hold your reservation for ~15 minutes. If you don't show up,
        the next user in the queue will get your place.
      </>
    ),
  },
  {
    question: "What trainings should I do?",
    answer: (
      <>
        We assume all users are beginners, so we provide training for all our equipment, both on this website and also
        in person for some machines. To use a space, you must complete two compulsory bits of training:
        <ul className="list-disc pl-5">
          <li>
            The general induction for the location, either
            <ul className="list-disc pl-5">
              <li>
                <Link to="/training/$id" params={{ id: "2c8f9ab8-fa6a-11ee-9708-bbe8cad44a7b" }}>
                  <Button variant="hyperlink" className="text-lg">
                    Mainspace Induction
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/training/$id" params={{ id: "2c906c68-fa6a-11ee-9708-b7e22c4ed9e6" }}>
                  <Button variant="hyperlink" className="text-lg">
                    Heartspace Induction
                  </Button>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link to="/training/$id" params={{ id: "2c900a48-fa6a-11ee-9708-e701e7356315" }}>
              <Button variant="hyperlink" className="text-lg">
                Unpowered Hand Tools
              </Button>
            </Link>
          </li>
        </ul>
        You should also complete training for any machines you're planning to use. For machines the require in-person
        training, please book with a rep in the{" "}
        <a href="https://discord.gg/UK6e8GeArH">
          <Button variant="hyperlink" className="text-lg">
            Discord
          </Button>
        </a>{" "}
        or ask an on-shift rep (someone in a black apron) to train you and update your training record.
      </>
    ),
  },

  {
    question: "How should I dress?",
    answer: (
      <ul className="list-disc pl-5">
        <li>No skirts or shorts</li>
        <li>Tie long hair back</li>
        <li>Wear closed toe shoes</li>
        <li>Wear our red aprons</li>
        <li>Wear safety glasses</li>
      </ul>
    ),
  },
  {
    question: "What if I have other questions?",
    answer: (
      <>
        You can either:
        <ul className="list-disc pl-5">
          <li>
            Get in contact with us via our{" "}
            <Link to="/contact">
              <Button variant="hyperlink" className="text-lg">
                Contact
              </Button>
            </Link>{" "}
            page.
          </li>
          <li>Come into the space during opening hours and speak to one of our reps (someone in a black apron)</li>
        </ul>
        and we'll be happy to answer your questions.
      </>
    ),
  },
];

const ImageCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const images = [
    { src: "/boba.jpg", alt: "3D printed Boba Fett cosplay" },
    { src: "/inspecting materials.jpg", alt: "Users inspecting materials" },
    { src: "/reps inspecting badges.jpg", alt: "Reps inspecting badges" },
    { src: "/reps 2024.jpg", alt: "Reps 2024-2025" },
    { src: "/using the laser cutter.jpg", alt: "Users using a laser cutter" },
    { src: "/using the dremel.jpg", alt: "Users using the dremel" },
    { src: "/users at the social space.jpg", alt: "Reps and users at the social space" },
    { src: "/using the water jet.jpg", alt: "Users using the water jet cutter" },
    { src: "/using the sewing machine.jpg", alt: "Users using a sewing machine" },
    { src: "/using the electronics bench.jpg", alt: "Users using the electronics bench" },
  ] satisfies { src: string; alt: string }[];

  return (
    <>
      <Carousel
        opts={{
          loop: true,
          skipSnaps: true,
        }}
        setApi={setApi}
        plugins={[
          Autoplay({
            playOnInit: true,
            // stopOnInteraction: true,
            stopOnFocusIn: true,
          }),
          WheelGesturesPlugin(),
        ]}
        className="h-96 w-full items-center flex mb-8"
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.src} className="basis-1/2">
              <img src={image.src} alt={image.alt} className="object-cover h-full w-full aspect-[4/3]" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background" />
      <DotIndicator count={count} current={current} />
    </>
  );
};

const mainspaceCards = [
  {
    text: (
      <>
        The Mainspace is the iForge's go-to location for electronics, woodworking, and metalworking. We offer a variety
        of tools to allow you to tackle any sort of project. Whether you're a beginner looking to learn new skills or an
        experienced maker working on complex projects, the Mainspace is equipped to support you.
      </>
    ),
    img: <img src="ms inside.jpg" className="object-fill" />,
  },
  {
    text: (
      <>
        The Mainspace is located in{" "}
        <a href="https://g.co/kgs/hXYvVNH">
          <Button variant="hyperlink" className="text-xl">
            The Diamond
          </Button>
        </a>{" "}
        on the first floor. This location is easily accessible for students and staff to pop in to after lectures to
        design and manufacture with our volunteer reps.
      </>
    ),
    img: <img src="ms front.jpg" className="object-fill" />,
  },
].map(
  renderLocationCard(
    <>
      <MainspaceIcon tooltip={false} className="w-8 h-8" /> Mainspace
    </>,
  ),
);

const heartspaceCards = [
  {
    text: (
      <>
        The Heartspace is dedicated to crafts, textiles, vinyl cutting, and both SLA and PETG 3D printing. It's the
        perfect place for makers passionate about bringing their intricate designs and ideas to life. Whether you're
        exploring a new fashion idea, creating a custom gift, or prototyping a 3D printing, the Heartspace provides the
        tools and support to unleash your creativity.
      </>
    ),
    img: <img src="hs inside.jpg" className="object-fill" />,
  },
  {
    text: (
      <>
        The Heartspace is located in{" "}
        <a href="https://g.co/kgs/R65qVGb">
          <Button variant="hyperlink" className="text-xl">
            The Engineering Heartspace
          </Button>
        </a>{" "}
        above the café, the Heartspace offers an easily accessible, inspiring environment for students and staff.
      </>
    ),
    img: <img src="hs front.jpg" className="object-fill" />,
  },
].map(
  renderLocationCard(
    <>
      <HeartspaceIcon tooltip={false} className="w-8 h-8" /> Heartspace
    </>,
  ),
);

function renderLocationCard(header: React.ReactNode) {
  return (value, index) => (
    <div key={index} className="relative h-screen w-screen overflow-hidden snap-center">
      {value.img}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="absolute bottom-28 left-0 flex items-center justify-center">
        <h1 className="text-white font-bold flex-col max-w-[75%] text-left">
          <div className="flex items-center text-3xl pb-2">{header}</div>
          <Balancer className="text-xl" key={1}>
            {value.text}
          </Balancer>
        </h1>
      </div>
    </div>
  );
}

const LocationCards = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const count = mainspaceCards.length + heartspaceCards.length;
  const [current, setCurrent] = useState(0);
  const activeDotIndex = useTransform(scrollYProgress, [0, 1], [0, count - 1]);

  useEffect(() => {
    const handleScroll = () => setCurrent(Math.round(activeDotIndex.get()) + 1);
    const container: React.ReactHTMLElement<any> = ref.current;

    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [activeDotIndex]);

  return (
    <>
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll" ref={ref}>
        <div>
          {mainspaceCards}
          {heartspaceCards}
        </div>
      </div>
      {/* <DotIndicator count={count} current={current} orientation="vertical" /> */}
      {/* TODO re-enable */}
    </>
  );
};

const FAQEntries = () => {
  return (
    <>
      <div className="text-3xl font-bold">Frequently Asked Questions</div>
      <div className="not-prose mt-4 flex flex-col gap-4 md:mt-8">
        {faqItems.map((item, index) => (
          <Accordion key={index} type="single" collapsible>
            <AccordionItem value={item.question}>
              <AccordionTrigger className="text-left text-2xl">{item.question}</AccordionTrigger>
              <AccordionContent className="text-lg md:w-10/12">
                <Balancer>{item.answer}</Balancer>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </>
  );
};

const IndexComponent = () => {
  return (
    <>
      <Title prompt="Home" />
      <div className="flex justify-center my-10">
        <IForgeLogo className="w-96 pointer-events-none" />
      </div>
      <Balancer className="mx-14 text-4xl mb-2">
        The University of Sheffield's iForge is the UK's first student-led makerspace. We believe in learning through
        making.
      </Balancer>
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md">
        <ImageCarousel />
      </div>
      <Balancer className="mx-14 text-2xl mt-8 mb-4">
        Join us to collaborate, create, and innovate through hands-on making and learning.
      </Balancer>
      <Separator className="my-8" />
      <>
        <div className="text-3xl font-bold mx-14 mb-8">Our Locations</div>
        <LocationCards />
      </>
      <Separator className="my-8" />

      <div className="px-14">
        <Card className="flex-col w-full">
          <CardHeader className="font-bold text-center text-3xl">Sign Up Now!</CardHeader>
          <CardDescription className="p-4 flex justify-center">
            <Balancer className="flex text-lg justify-center">
              It's easy:
              <Timeline>
                {[
                  "Sign in with your Sheffield University Account",
                  "Complete the online training",
                  "Sign the user agreement",
                  "You're free to use the space!",
                ].map((value, idx, array) => (
                  <TimelineItem key={value}>
                    <TimelineHeading className="flex items-center text-foreground overflow-visible text-ellipsis whitespace-normal">
                      {value}
                    </TimelineHeading>
                    <TimelineDot status="done" className="rounded-sm" />
                    {idx !== array.length - 1 && <TimelineLine done={true} className="min-h-4" />}
                  </TimelineItem>
                ))}
              </Timeline>
            </Balancer>
          </CardDescription>
          <CardContent className="not-prose mx-auto flex items-center gap-2 justify-center">
            <Link to="/auth/login">
              <Button className="w-fit">Get Started{/* TODO link to old blog page? */}</Button>
            </Link>
            <a href="https://iforgesheffield.org/user-projects">
              <Button className="w-fit" variant="link">
                Get inspired <ArrowUpRight className="ml-1" size="16" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      <div className="mx-14">
        <FAQEntries />
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
