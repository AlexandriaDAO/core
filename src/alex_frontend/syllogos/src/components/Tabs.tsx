import React from "react";
import { Link } from "@tanstack/react-router";
import { Home, PenSquare, Compass, User } from "lucide-react";

const tabClassName = "transition-all duration-100 cursor-pointer font-syne text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-normal tracking-normal flex justify-center items-center gap-2 text-[#FFF] py-1 sm:py-2 px-2 sm:px-3";
const activeClassName = "opacity-100 border-b-2 border-white";
const inactiveClassName = "opacity-70 hover:opacity-100";

export default function Tabs() {
	return (
		<div className="flex items-center gap-2 sm:gap-4 md:gap-8 justify-center">
			<Link
				to="/"
				className={tabClassName}
				activeProps={{ className: activeClassName }}
				inactiveProps={{ className: inactiveClassName }}
			>
				<Home className="h-4 w-4" />
				<span className="hidden sm:inline">Home</span>
			</Link>

			<Link
				to="/write"
				className={tabClassName}
				activeProps={{ className: activeClassName }}
				inactiveProps={{ className: inactiveClassName }}
			>
				<PenSquare className="h-4 w-4" />
				<span className="hidden sm:inline">Write</span>
			</Link>

			<Link
				to="/browse"
				className={tabClassName}
				activeProps={{ className: activeClassName }}
				inactiveProps={{ className: inactiveClassName }}
			>
				<Compass className="h-4 w-4" />
				<span className="hidden sm:inline">Browse</span>
			</Link>

			<Link
				to="/profile"
				className={tabClassName}
				activeProps={{ className: activeClassName }}
				inactiveProps={{ className: inactiveClassName }}
			>
				<User className="h-4 w-4" />
				<span className="hidden sm:inline">Profile</span>
			</Link>
		</div>
	);
}
