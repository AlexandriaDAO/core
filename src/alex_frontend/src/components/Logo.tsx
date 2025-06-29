import React from "react";
import { Link } from "@tanstack/react-router";

interface LogoProps {
  className?: string;
}

function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      to="/"
      className={`cursor-pointer hover:opacity-80 ${className}`}
    >
      <div className="flex flex-col items-center">
        <span
          style={{
            color: 'var(--white, var(--Colors-LightMode-Text-text-100, #FFF))',
            fontFamily: 'Syne',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: 800,
            lineHeight: 'normal'
          }}
        >
          ALEX
        </span>
        <span
          style={{
            color: 'var(--white, var(--Colors-LightMode-Text-text-100, #FFF))',
            fontFamily: 'Syne',
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: 400,
            opacity: 0.6,
            marginTop: '-4px'
          }}
        >
          pre-alpha
        </span>
      </div>
    </Link>
  );
}

export default Logo;