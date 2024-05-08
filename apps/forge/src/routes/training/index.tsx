import Title from "@/components/title";
import { useUser } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@ui/components/ui/card";
import { Separator } from "@ui/components/ui/separator";
import React from "react";

export default function Component() {
  return (
    <>
      <Title prompt="Training" />
      <div className="p-4 mt-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Welcome to the iForge's User Training
          </h1>
        </div>
        {/* <div className="mb-8">  // TODO add this
          <h2 className="text-2xl font-semibold text-center mb-4">Search for a course</h2>
          <div className="relative w-3/4 mx-auto">
            <input
              placeholder="Enter all or part of a course name..."
              className="border-2 bg-inherit border-gray-300 rounded-md py-2 px-4 w-full ring-offset-background placeholder:text-muted-foreground outline-primary"
            />
            <Button className="absolute top-0 right-0 m-0.5">Search</Button>
          </div>
        </div> */}
        <h4 className="text-2xl font-semibold mb-4">Locations</h4>
        <div className="grid grid-cols-3 gap-4 align-middle">
          <Card className="w-full hover:bg-accent">
            <Link to="locations/mainspace">
              <CardContent className="m-4">
                <img
                  alt="iForge Mainspace"
                  height="100"
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: "200/100",
                    objectFit: "cover",
                  }}
                />
                <CardTitle>iForge Mainspace</CardTitle>
                <CardDescription>Training for the iForge Mainspace located in the Diamond.</CardDescription>
              </CardContent>
            </Link>
          </Card>
          <Card className="w-full hover:bg-accent">
            <Link to="locations/heartspace">
              <CardContent className="m-4">
                <img
                  alt="iForge Heartspace"
                  height="100"
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: "200/100",
                    objectFit: "cover",
                  }}
                />
                <CardTitle>iForge Heartspace</CardTitle>
                <CardDescription>Training for the iForge Mainspace located in the Heartspace.</CardDescription>
              </CardContent>
            </Link>
          </Card>
          <Card className="w-full hover:bg-accent">
            {/* <Link to="locations/george-porter"> */}
              <CardContent className="m-4" onClick={() => window.location.href = "https://training.iforge.shef.ac.uk/subject-areas/george-porter-cca-rep/online"}>
                <img
                  alt="George Porter CCA Workshop"
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: "200/100",
                    objectFit: "cover",
                  }}
                  height="100"
                />
                <CardTitle>George Porter CCA Workshop</CardTitle>
                <CardDescription>
                  Training appropriate for CCA members looking to gain access to the iTec and its training.
                </CardDescription>
              </CardContent>
            {/* </Link> */}
          </Card>
        </div>
        <br />
        <Separator />
        <h3 className="text-2xl font-semibold text-center m-4">Useful links</h3>
        <br />
        <div>
          <div className="grid grid-cols-2 gap-4 align-middle">
            <Card className="w-full hover:bg-accent">
              <Link to="approved-materials">
                <CardContent className="m-4">
                  <img
                    alt="Approved materials"
                    height="100"
                    src="/placeholder.svg"
                    style={{
                      aspectRatio: "100/100",
                      objectFit: "cover",
                    }}
                    width="100"
                  />
                  <CardTitle>Approved Materials</CardTitle>
                  <CardDescription>COSHH regulations for materials in the iForge.</CardDescription>
                </CardContent>
              </Link>
            </Card>
            <Card className="w-full hover:bg-accent">
              <Link to="risk-assessments">
                <CardContent className="m-4">
                  <img
                    alt="iForge Risk Assessment"
                    height="100"
                    src="/placeholder.svg"
                    style={{
                      aspectRatio: "100/100",
                      objectFit: "cover",
                    }}
                    width="100"
                  />
                  <CardTitle>iForge Risk Assessment</CardTitle>
                  <CardDescription>The various risk assessments for the spaces.</CardDescription>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/training/")({
  component: Component,
});
