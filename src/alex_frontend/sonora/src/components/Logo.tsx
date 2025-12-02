import React from "react";
import { Link } from "@tanstack/react-router";

interface LogoProps {
	className?: string;
}

function Logo({ className = "" }: LogoProps) {
	return (
		<Link to="/" className={`cursor-pointer hover:opacity-80 ${className}`}>
			<div className="flex flex-col items-center">
				<span className="text-white font-syne font-extrabold leading-normal text-[18px] sm:text-[24px]">
					SONORA
				</span>
				<span className="text-white font-syne font-normal opacity-60 -mt-1 text-[8px] sm:text-[10px]">
					powered by Alexandria
				</span>
			</div>
		</Link>
	);
}

export default Logo;
