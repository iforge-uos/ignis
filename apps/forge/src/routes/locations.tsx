import { createFileRoute, Link } from "@tanstack/react-router";
import heartspaceLocationImage from "@/../public/training/heartspace.jpg?lqip";
import mainspaceLocationImage from "@/../public/training/mainspace.jpg?lqip";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/card";

export function Component() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold">What are we?</h1>
        </header>

        <p>
          The best way to find out is to come visit! We currently have two locations which are open Monday to Friday
          during The University of Sheffield's term time.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-mainspace">
                Location 1: iForge Mainspace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md relative">
                <img
                  src={mainspaceLocationImage.src}
                  width={mainspaceLocationImage.width}
                  height={mainspaceLocationImage.height}
                  style={{ backgroundImage: `url("${mainspaceLocationImage.lqip}")`, backgroundSize: "cover" }}
                  alt="iForge Mainspace"
                  className="w-auto h-84 object-cover mb-4"
                />
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Location:</strong> The Diamond Floor 1, turn left after crossing the barriers.
                </p>
                <p>
                  <strong>Opening times:</strong> 12:00 - 20:00, Monday - Friday during University of Sheffield term
                  time subject to exams and holidays.
                </p>
                <p>
                  <strong>A little bit about it:</strong> iForge Mainspace holds more traditional manufacturing
                  equipment such as laser cutters and power drills, and it's all free to use!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-heartspace">
                Location 2: iForge Heartspace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md relative">
                <img
                  src={heartspaceLocationImage.src}
                  width={heartspaceLocationImage.width}
                  height={heartspaceLocationImage.height}
                  style={{ backgroundImage: `url("${heartspaceLocationImage.lqip}")`, backgroundSize: "cover" }}
                  alt="iForge Heartspace"
                  className="w-auto h-84 object-cover mb-4"
                />
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Location:</strong> The Heartspace floor 1, above the cafe, the entrance is round the back of
                  this image.
                </p>
                <p>
                  <strong>Opening times:</strong> 12:00 - 17:00, Monday - Friday during University of Sheffield term
                  time subject to exams and holidays.
                </p>
                <p>
                  <strong>A little bit about it:</strong> iForge Heartspace holds textile and vinyl equipment such as
                  sewing machines and pin badge makers, and it's all free to use!
                </p>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}

export const Route = createFileRoute("/locations")({
  component: Component,
});
