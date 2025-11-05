import Title from "@/components/title";
import env from "@/lib/env";
import { client } from "@/lib/orpc";
import { ClientContainer } from "@packages/ui/calendar/components/client-container";
import { CalendarProvider } from "@packages/ui/calendar/contexts/calendar-context";
import { createFileRoute, Link } from "@tanstack/react-router";

function RouteComponent() {
  return (
    <>
      <Title prompt="Events" />
      <div className="px-14 py-8">
        <h1 className="text-5xl font-futura mb-4">Workshops and Events</h1>
        <p>
          The iForge hosts several Workshops and Events over the academic year. They range from activities that have
          limited space and users need to book onto, to day long events where anyone can come and go throughout the day.
        </p>
        <br />
        <p>
          We also host activities done in collaboration with societies from The University of Sheffield! If you know of
          a society that is interested in creating an event with the iForge please contact our team using any of the
          links on our <Link to="/contact" className="link-underline text-primary">Contact Us</Link> page.
        </p>
        <br />
        <p>
          Upcoming Workshops and Events Have a look at our upcoming events! You can sign-up to the public ones and
          explore the private ones to see if they inspire you to plan your own!
        </p>
        <br />
        <ClientContainer view="month" editable={false} />
      </div>
    </>
  );
}

export const Route = createFileRoute("/events")({
  component: () => {
    const {events, googleCalendarId} = Route.useLoaderData()
    return <CalendarProvider
      users={
        [ // TODO use this for distinguishing between Event.type (events, workshops etc.)
          // { id: "0", name: "Events", picturePath: "/favicon.svg" }
        ]
      }
      events={events}
      googleCalendarId={googleCalendarId}
    >
      <RouteComponent />
    </CalendarProvider>
  },
  loader: async () => {
    const events = await client.events.upcoming();
    return { events, googleCalendarId: env.google.EVENTS_CALENDAR };
  },
});
