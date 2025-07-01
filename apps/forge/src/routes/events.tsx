import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

// TODO look at https://big-calendar.vercel.app/month-view

export const Route = createFileRoute("/events")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h2>Workshops and Events</h2>
      The iForge hosts several Workshops and Events over the academic year. They range from activities that have limited
      space and users need to book onto, to day long events where anyone can come and go throughout the day.
      <br />
      We also host activities done in collaboration with societies from The University of Sheffield! If you know of a
      society that is interested in creating an event with the iForge please contact our team using any of the links on
      our Contact Us page.
      <br />
      Upcoming Workshops and Events Have a look at our upcoming events! You can sign-up to the public ones and explore
      the private ones to see if they inspire you to plan your own!
    </>
  );
}
