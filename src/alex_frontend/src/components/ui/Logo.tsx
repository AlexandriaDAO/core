import React from "react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  className?: string;
}

function Logo({ className = "" }: LogoProps) {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate('/')}
      className={`cursor-pointer hover:opacity-80 ${className}`}
    >
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
    </div>
  );
}

export default Logo;