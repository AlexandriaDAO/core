import React from "react";
import { Link } from "@tanstack/react-router";
import { Home, Edit, User } from "lucide-react";

export default function Tabs() {
	return (
		<div className="flex items-center gap-2 sm:gap-4 md:gap-8 justify-center">
			<Link
				to="/"
				className="transition-all duration-100 cursor-pointer font-syne text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-normal tracking-normal flex justify-center items-center gap-2 text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100 border-b-2 border-white" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				<Home className="h-4 w-4" />
				<span className="hidden sm:inline">Home</span>
			</Link>
			
			<Link
				to="/create"
				className="transition-all duration-100 cursor-pointer font-syne text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-normal tracking-normal flex justify-center items-center gap-2 text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100 border-b-2 border-white" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				<Edit className="h-4 w-4" />
				<span className="hidden sm:inline">Create</span>
			</Link>
			
			<Link
				to="/profile"
				className="transition-all duration-100 cursor-pointer font-syne text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-normal tracking-normal flex justify-center items-center gap-2 text-[#FFF] py-1 sm:py-2 px-2 sm:px-3"
				activeProps={{ className: "opacity-100 border-b-2 border-white" }}
				inactiveProps={{ className: "opacity-70 hover:opacity-100" }}
			>
				<User className="h-4 w-4" />
				<span className="hidden sm:inline">Profile</span>
			</Link>
		</div>
	);
}
