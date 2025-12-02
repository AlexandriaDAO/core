import React from "react";
import { Link } from "@tanstack/react-router";

export default function Tabs() {
	return (
		<div className="flex items-center gap-2 sm:gap-4 md:gap-8 justify-center">
			<Link
				to="/browse"
				className="transition-all duration-100 cursor-pointer font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				Browse
			</Link>

			<Link
				to="/record"
				className="transition-all duration-100 cursor-pointer font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				Record
			</Link>

			<Link
				to="/archive"
				className="transition-all duration-100 cursor-pointer font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				Collection
			</Link>
			<Link
				to="/market"
				className="transition-all duration-100 cursor-pointer font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				Shop
			</Link>
		</div>
	);
}
