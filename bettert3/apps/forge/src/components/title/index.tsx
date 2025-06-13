// TitleBar.tsx
import React from "react";

interface TitleProps {
  prompt: string;
}

const Title: React.FC<TitleProps> = ({ prompt }) => {
  const isDevelopment = import.meta.env.DEV;

  return <title>{isDevelopment ? `DEV iForge | ${prompt}` : `iForge | ${prompt}`}</title>;
};

export default Title;
