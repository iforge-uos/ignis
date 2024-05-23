import React from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardTitle } from "@ui/components/ui/card";
import { Separator } from "@ui/components/ui/separator";

interface IndexCardProps {
    to?: string;
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
    onClick?: () => void;
}

const IndexCard: React.FC<IndexCardProps> = ({ to, imageSrc, imageAlt, title, description, onClick }) => {
    return (
        <Card className="w-full transition-all duration-300 hover:shadow-lg group flex flex-col gap-2.5 p-4 border rounded-lg md:gap-4 md:p-8">
            <br />
            {to ? (
                <Link to={to}>
                    <CardContent className="m-4">
                        <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
                        <Separator className="my-2" />
                        <br />
                        <div className="overflow-hidden rounded-md">
                            <img
                                alt={imageAlt}
                                height="100"
                                src={imageSrc}
                                className="aspect-[2/1] object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <CardDescription className="text-lg mt-2">{description}</CardDescription>
                    </CardContent>
                </Link>
            ) : (
                <CardContent className="m-4" onClick={onClick}>
                    <div className="overflow-hidden rounded-md">
                        <img
                            alt={imageAlt}
                            height="100"
                            src={imageSrc}
                            className="aspect-[2/1] object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <CardTitle className="text-3xl font-semibold mt-4">{title}</CardTitle>
                    <CardDescription className="text-lg mt-2 text-balance">{description}</CardDescription>
                </CardContent>
            )}
        </Card>
    );
};

export default IndexCard;
