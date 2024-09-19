import React from "react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  className?: string;
}

function Logo({ className = "" }: LogoProps) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate('/whitepaper')}
            className={`cursor-pointer hover:opacity-80 ${className}`}
        >
            <img
                src="/images/logo.png"
                alt="UG Logo"
                className="h-8 w-auto"
            />
        </div>
    );
}

export default Logo;