import { Link } from "@tanstack/react-router";

export default function RepNotice() {
  return (
    <div>
      <h2 className="text-4xl font-futura mb-2">iForge Reps take care of machinery</h2>

      <p className="mb-3">
        The Hardware team is responsible for understanding and maintaining the various pieces of machinery we have at
        the iForge. If there is an unusual issue with a piece of equipment, the Hardware team is the first to be
        notified. Find out more about them and the other teams that keep the iForge running on our{" "}
        <Link to="/our-reps" className="link-underline">Meet Our Team</Link> page!
      </p>
      <p className="mb-3">
        If you want to be a part of the Hardware team or any other iForge team you can register your interest{" "}
        <a href="https://forms.gle/FQ81QtXQWAUuEW4E8" className="link-underline">
          here
        </a>
        .
      </p>
      <p className="mb-3">
        If you want to see what other teams you can be a part of by volunteering with the iForge click{" "}
        <a href="https://docs.iforge.sheffield.ac.uk/users/our_teams" className="link-underline">
          here
        </a>
        .
      </p>
    </div>
  );
}
