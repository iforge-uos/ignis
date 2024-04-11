// TitleBar.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

interface TitleProps {
    prompt: string;
}

const Title: React.FC<TitleProps> = ({ prompt }) => {
    const isDevelopment = process.env.NODE_ENV === "development";

    return (
        <Helmet>
            <title>{isDevelopment ? `DEV iForge | ${prompt}` : `iForge | ${prompt}`}</title>
        </Helmet>
    );
};

export default Title;
