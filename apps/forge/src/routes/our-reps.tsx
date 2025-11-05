import { Separator } from "@packages/ui/components/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import reps17Image from "@/../public/reps/17.webp?lqip";
import reps22Image from "@/../public/reps/22.webp?lqip";
import reps23Image from "@/../public/reps/23.webp?lqip";
import reps24Image from "@/../public/reps/24.webp?lqip";
import reps25Image from "@/../public/reps/25.webp?lqip";
import Title from "@/components/title";

function RouteComponent() {
  return (
    <>
      <Title prompt="Our Reps" />
      <div className="px-14 py-8">
        <h1 className="text-5xl font-futura mb-4">Our Reps</h1>
        <p className="text-lg">
          The iForge is run by University of Sheffield students who volunteer their time and energy managing the{" "}
          <Link to="/locations#mainspace" className="text-primary link-underline">
            Mainspace
          </Link>{" "}
          in the Diamond and the{" "}
          <Link to="/locations#heartspace" className="text-primary link-underline">
            Heartspace
          </Link>{" "}
          and working behind the scenes to continually improve what the iForge can offer you. You can identify them by
          their black apron and golden name badge in either location.
        </p>
        {/* <p>
        This page is a tribute to all the Reps who are working with the iForge now. If you would like to see our past
        Reps you can take a look at our "
        <Link to="/alumni" className="text-primary link-underline">
          Our Legacy
        </Link>
        " page.
      </p> */}
        <p className="text-lg">
          If you would like to become an iForge Rep, please register your interest{" "}
          <a href="https://forms.gle/FQ81QtXQWAUuEW4E8" className="text-primary link-underline">
            here
          </a>
          .
        </p>
        <br />
        <p className="font-bold text-lg">See if you recognise any of our reps.</p>
        <br />
        <h3 className="text-3xl mb-2 font-futura">Reps 2024-2025</h3>
        <img
          src={reps25Image.src}
          width={reps25Image.width}
          height={reps25Image.height}
          style={{ backgroundImage: `url("${reps25Image.lqip}")`, backgroundSize: "cover" }}
          alt="Reps from 2024-2025"
          className="h-84 object-cover rounded-md mb-4 max-w-[75rem]"
        />
        <Separator className="my-4" />
        <h3 className="text-3xl mb-2 font-futura">Reps 2023-2024</h3>
        <img
          src={reps24Image.src}
          width={reps24Image.width}
          height={reps24Image.height}
          style={{ backgroundImage: `url("${reps24Image.lqip}")`, backgroundSize: "cover" }}
          alt="Reps from 2023-2024"
          className="h-84 object-cover rounded-md mb-4 max-w-[75rem]"
        />
        <Separator className="my-4" />
        <h3 className="text-3xl mb-2 font-futura">Reps 2022-2023</h3>
        <img
          src={reps23Image.src}
          width={reps23Image.width}
          height={reps23Image.height}
          style={{ backgroundImage: `url("${reps23Image.lqip}")`, backgroundSize: "cover" }}
          alt="Reps from 2023-2024"
          className="h-84 object-cover rounded-md mb-4 max-w-[75rem]"
        />
        <Separator className="my-4" />
        <h3 className="text-3xl mb-2 font-futura">Reps 2021-2022</h3>
        <img
          src={reps22Image.src}
          width={reps22Image.width}
          height={reps22Image.height}
          style={{ backgroundImage: `url("${reps22Image.lqip}")`, backgroundSize: "cover" }}
          alt="Reps from 2022-2023"
          className="h-84 object-cover rounded-md mb-4 max-w-[75rem]"
        />
        <Separator className="my-4" />
        <h3 className="text-3xl mb-2 font-futura">Reps 2017-2018</h3>
        <img
          src={reps17Image.src}
          width={reps17Image.width}
          height={reps17Image.height}
          style={{ backgroundImage: `url("${reps17Image.lqip}")`, backgroundSize: "cover" }}
          alt="Reps from 2017-2018"
          className="aspect-square object-cover rounded-md"
        />
      </div>
    </>
  );
}

export const Route = createFileRoute("/our-reps")({
  component: RouteComponent,
});
