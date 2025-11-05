import { createFileRoute, Link } from "@tanstack/react-router";
import LocationCard from "@/components/LocationCard";
import Title from "@/components/title";
import { IForgeLogo } from "@/icons/IForge";

export function Component() {
  return (
    <>
      <Title prompt="Home" />
      <div className="mx-14 my-8 space-y-8 mb-8">
        <p className="text-4xl mb-6 font-futura text-balance">
          We currently have two locations which are open Monday to Friday during The University of Sheffield's term
          time.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <LocationCard name="MAINSPACE" id="mainspace">
            <p>
              <strong>Location:</strong> Diamond Floor 1, turn left after the stairs from the ground floor.
            </p>
            <p>
              <strong>Opening times:</strong> 12:00 - 20:00, Monday - Friday during University of Sheffield term time.
            </p>
            <p>
              <strong>What happens here?</strong> iForge Mainspace holds more traditional manufacturing equipment such
              as laser cutters and power drills, and it's all free to use!
            </p>
          </LocationCard>

          <LocationCard name="HEARTSPACE" id="heartspace">
            <p>
              <strong>Location:</strong> Heartspace Floor 1, above the café, (enter round the back of this image)
            </p>
            <p>
              <strong>Opening times:</strong> 12:00 - 17:00, Monday - Friday during University of Sheffield term time.
            </p>
            <p>
              <strong>What happens here?</strong> iForge Heartspace holds textile and vinyl equipment such as sewing
              machines and pin badge makers, and it's all free to use!
            </p>
          </LocationCard>
        </div>

        <section className="prose dark:prose-invert max-w-none">
          <h2>What is a Makerspace?</h2>
          <p>According to Makerspaces.com:</p>
          <blockquote>
            <p>
              A makerspace is a collaborative work space inside a school, library or separate public/private facility
              for making, learning, exploring and sharing that uses high tech to no tech tools.
            </p>
          </blockquote>

          <p>
            The iForge is a Makerspace which lives in the <strong>University of Sheffield</strong> and is open to{" "}
            <strong>staff and students</strong>. It is <strong>free to use</strong>, the only thing you have to do is
            some{" "}
            <Link to="/training" className="!no-underline !underline-offset-4 hover:!underline text-primary">
              online training
            </Link>{" "}
            and then ring the doorbell during our open hours.
          </p>
          <p>
            You can find out about the incredible list of facilities we have by exploring our website or paying us a
            visit during our open hours.
          </p>
          <p>
            Sponsorships allow us to keep growing while our student volunteers keep us running. If you are interested in
            joining the team which keeps the iForge running, register your interest{" "}
            <a
              className="!no-underline !underline-offset-4 hover:!underline text-primary"
              href="https://forms.gle/USNr3Aagg5n1DfQu8"
            >
              here
            </a>
            . If you are interested in sponsoring us, please contact the Relations Team at{" "}
            <a
              href="mailto:relations.iforge@sheffield.ac.uk"
              className="!no-underline !underline-offset-4 hover:!underline text-primary"
              rel="noopener"
            >
              relations.iforge@sheffield.ac.uk
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}

export const Route = createFileRoute("/locations")({
  component: Component,
});
